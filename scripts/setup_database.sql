-- ============================================
-- COMPLETE DATABASE SETUP FOR SUPPLEMENTS ECOMMERCE
-- ============================================

-- 1. CREATE PROFILES TABLE
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  address text,
  city text,
  state text,
  zip_code text,
  country text default 'México',
  referral_code text unique not null,
  referred_by uuid references public.profiles(id),
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Drop existing policies
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id or is_admin = true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id or is_admin = true);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

-- Create indexes
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);
create index if not exists idx_profiles_is_admin on public.profiles(is_admin);

-- 2. HELPER FUNCTIONS
-- ============================================

-- Function to generate unique referral code
create or replace function generate_referral_code()
returns text
language plpgsql
as $$
declare
  code text;
  exists boolean;
begin
  loop
    code := upper(substring(md5(random()::text) from 1 for 8));
    select count(*) > 0 into exists
    from public.profiles
    where referral_code = code;
    exit when not exists;
  end loop;
  return code;
end;
$$;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  referrer_id uuid;
begin
  referrer_id := (new.raw_user_meta_data->>'referred_by')::uuid;
  
  insert into public.profiles (id, full_name, referral_code, referred_by)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario'),
    generate_referral_code(),
    referrer_id
  );
  return new;
end;
$$;

-- Drop and create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Trigger to auto-update updated_at on profiles
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

-- 3. CREATE FAVORITES TABLE
-- ============================================
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, product_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Users can view their own favorites" on public.favorites;
drop policy if exists "Users can insert their own favorites" on public.favorites;
drop policy if exists "Users can delete their own favorites" on public.favorites;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists favorites_product_id_idx on public.favorites(product_id);

-- 4. CREATE COUPONS TABLE
-- ============================================
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  min_purchase numeric default 0,
  max_uses integer,
  current_uses integer default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.coupons enable row level security;

drop policy if exists "Anyone can view active coupons" on public.coupons;
drop policy if exists "Admins can manage coupons" on public.coupons;

create policy "Anyone can view active coupons"
  on public.coupons for select
  using (is_active = true and (expires_at is null or expires_at > now()));

create policy "Admins can manage coupons"
  on public.coupons for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_is_active_idx on public.coupons(is_active);

-- 5. CREATE REFERRALS TABLE
-- ============================================
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referred_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed', 'rewarded')),
  reward_amount numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  unique(referrer_id, referred_id)
);

alter table public.referrals enable row level security;

drop policy if exists "Users can view their referrals" on public.referrals;
drop policy if exists "Admins can view all referrals" on public.referrals;

create policy "Users can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referred_id);

create policy "Admins can view all referrals"
  on public.referrals for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
create index if not exists referrals_referred_id_idx on public.referrals(referred_id);
create index if not exists referrals_status_idx on public.referrals(status);

-- 6. CREATE USER_COUPONS TABLE
-- ============================================
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  used boolean default false,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_coupons enable row level security;

drop policy if exists "Users can view their own coupons" on public.user_coupons;
drop policy if exists "Users can update their own coupons" on public.user_coupons;
drop policy if exists "Admins can manage user coupons" on public.user_coupons;

create policy "Users can view their own coupons"
  on public.user_coupons for select
  using (auth.uid() = user_id);

create policy "Users can update their own coupons"
  on public.user_coupons for update
  using (auth.uid() = user_id);

create policy "Admins can manage user coupons"
  on public.user_coupons for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create index if not exists user_coupons_user_id_idx on public.user_coupons(user_id);
create index if not exists user_coupons_coupon_id_idx on public.user_coupons(coupon_id);

-- 7. CREATE ORDERS TABLE
-- ============================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_number text unique not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric default 0,
  tax numeric default 0,
  total numeric not null,
  coupon_code text,
  shipping_address jsonb not null,
  payment_method text,
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can update all orders" on public.orders;

create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Admins can update all orders"
  on public.orders for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and is_admin = true
    )
  );

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_order_number_idx on public.orders(order_number);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

-- Trigger to auto-update updated_at on orders
drop trigger if exists update_orders_updated_at on public.orders;
create trigger update_orders_updated_at
  before update on public.orders
  for each row
  execute function update_updated_at_column();

-- 8. CREATE ANALYTICS VIEWS
-- ============================================

-- View for admin analytics
create or replace view admin_analytics as
select
  (select count(*) from public.profiles) as total_users,
  (select count(*) from public.orders) as total_orders,
  (select coalesce(sum(total), 0) from public.orders where payment_status = 'paid') as total_revenue,
  (select count(*) from public.orders where created_at >= current_date - interval '30 days') as orders_last_30_days,
  (select coalesce(sum(total), 0) from public.orders where created_at >= current_date - interval '30 days' and payment_status = 'paid') as revenue_last_30_days;

-- Grant access to admins only
grant select on admin_analytics to authenticated;
