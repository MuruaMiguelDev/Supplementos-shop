-- Create referrals table to track referral rewards
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles(id) on delete cascade,
  referee_id uuid not null references public.profiles(id) on delete cascade,
  referrer_coupon_id uuid references public.coupons(id) on delete set null,
  referee_coupon_id uuid references public.coupons(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(referrer_id, referee_id)
);

-- Enable RLS
alter table public.referrals enable row level security;

-- RLS Policies for referrals
create policy "Users can view their own referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- Create indexes
create index if not exists referrals_referrer_id_idx on public.referrals(referrer_id);
create index if not exists referrals_referee_id_idx on public.referrals(referee_id);

-- Function to create referral coupons when someone signs up with a referral code
create or replace function handle_referral_signup()
returns trigger
language plpgsql
security definer
as $$
declare
  referrer_profile_id uuid;
  referrer_coupon_code text;
  referee_coupon_code text;
  referrer_coupon_id uuid;
  referee_coupon_id uuid;
begin
  -- Check if user was referred by someone
  if new.referred_by is not null then
    referrer_profile_id := new.referred_by;
    
    -- Generate unique coupon codes
    referrer_coupon_code := 'REF-' || upper(substring(md5(random()::text) from 1 for 6));
    referee_coupon_code := 'WELCOME-' || upper(substring(md5(random()::text) from 1 for 6));
    
    -- Create coupon for referrer (10% discount)
    insert into public.coupons (code, discount_type, discount_value, description, max_uses, created_by)
    values (
      referrer_coupon_code,
      'percentage',
      10,
      'Descuento por referir a un amigo',
      1,
      referrer_profile_id
    )
    returning id into referrer_coupon_id;
    
    -- Create coupon for referee (15% discount on first purchase)
    insert into public.coupons (code, discount_type, discount_value, description, max_uses, created_by)
    values (
      referee_coupon_code,
      'percentage',
      15,
      'Descuento de bienvenida por registro con código de referido',
      1,
      new.id
    )
    returning id into referee_coupon_id;
    
    -- Create referral record
    insert into public.referrals (referrer_id, referee_id, referrer_coupon_id, referee_coupon_id, status)
    values (referrer_profile_id, new.id, referrer_coupon_id, referee_coupon_id, 'completed');
  end if;
  
  return new;
end;
$$;

-- Trigger to handle referral signup
drop trigger if exists on_profile_created on public.profiles;

create trigger on_profile_created
  after insert on public.profiles
  for each row
  execute function handle_referral_signup();
