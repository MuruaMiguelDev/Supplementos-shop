-- Create coupons table
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric not null check (discount_value > 0),
  description text,
  min_purchase numeric default 0,
  max_uses integer,
  uses_count integer default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.coupons enable row level security;

-- RLS Policies for coupons - anyone can view active coupons
create policy "Anyone can view active coupons"
  on public.coupons for select
  using (is_active = true and (expires_at is null or expires_at > now()));

-- Create index
create index if not exists coupons_code_idx on public.coupons(code);
create index if not exists coupons_is_active_idx on public.coupons(is_active);
