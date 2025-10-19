-- Create user_coupons junction table to track which coupons belong to which users
create table if not exists public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coupon_id uuid not null references public.coupons(id) on delete cascade,
  is_used boolean default false,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, coupon_id)
);

-- Enable RLS
alter table public.user_coupons enable row level security;

-- RLS Policies
create policy "Users can view their own coupons"
  on public.user_coupons for select
  using (auth.uid() = user_id);

create policy "Users can update their own coupons"
  on public.user_coupons for update
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists user_coupons_user_id_idx on public.user_coupons(user_id);
create index if not exists user_coupons_coupon_id_idx on public.user_coupons(coupon_id);

-- Function to assign coupon to user when created
create or replace function assign_coupon_to_user()
returns trigger
language plpgsql
security definer
as $$
begin
  -- If coupon was created by a user, assign it to them
  if new.created_by is not null then
    insert into public.user_coupons (user_id, coupon_id)
    values (new.created_by, new.id)
    on conflict (user_id, coupon_id) do nothing;
  end if;
  
  return new;
end;
$$;

-- Trigger to auto-assign coupons
drop trigger if exists on_coupon_created on public.coupons;

create trigger on_coupon_created
  after insert on public.coupons
  for each row
  execute function assign_coupon_to_user();
