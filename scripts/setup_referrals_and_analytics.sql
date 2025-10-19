-- =====================================================
-- SETUP REFERRALS SYSTEM AND ANALYTICS
-- This script creates the referral handling system and analytics views
-- =====================================================

-- =====================================================
-- 1. CREATE REFERRAL HANDLING FUNCTION AND TRIGGER
-- =====================================================

-- Drop trigger first, then function with CASCADE to handle dependencies
drop trigger if exists on_profile_created_referral on public.profiles;
drop function if exists handle_referral_signup() cascade;

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
    referrer_coupon_code := 'REF-' || upper(substring(md5(random()::text) from 1 for 8));
    referee_coupon_code := 'WELCOME-' || upper(substring(md5(random()::text) from 1 for 8));
    
    -- Create coupon for referrer (10% discount)
    insert into public.coupons (
      code, 
      discount_type, 
      discount_value, 
      description, 
      max_uses, 
      created_by,
      is_active,
      expires_at
    )
    values (
      referrer_coupon_code,
      'percentage',
      10,
      'Descuento por referir a un amigo',
      1,
      referrer_profile_id,
      true,
      now() + interval '90 days'
    )
    returning id into referrer_coupon_id;
    
    -- Assign coupon to referrer
    insert into public.user_coupons (user_id, coupon_id, is_used)
    values (referrer_profile_id, referrer_coupon_id, false);
    
    -- Create coupon for referee (15% discount on first purchase)
    insert into public.coupons (
      code, 
      discount_type, 
      discount_value, 
      description, 
      max_uses, 
      created_by,
      is_active,
      expires_at
    )
    values (
      referee_coupon_code,
      'percentage',
      15,
      'Descuento de bienvenida por registro con código de referido',
      1,
      new.id,
      true,
      now() + interval '30 days'
    )
    returning id into referee_coupon_id;
    
    -- Assign coupon to referee
    insert into public.user_coupons (user_id, coupon_id, is_used)
    values (new.id, referee_coupon_id, false);
    
    -- Create referral record
    insert into public.referrals (
      referrer_id, 
      referee_id, 
      referrer_coupon_id, 
      referee_coupon_id, 
      status
    )
    values (
      referrer_profile_id, 
      new.id, 
      referrer_coupon_id, 
      referee_coupon_id, 
      'completed'
    );
  end if;
  
  return new;
end;
$$;

-- Create trigger to handle referral signup
create trigger on_profile_created_referral
  after insert on public.profiles
  for each row
  execute function handle_referral_signup();

-- =====================================================
-- 2. CREATE ANALYTICS VIEWS
-- =====================================================

-- Drop existing views if they exist
drop view if exists daily_sales cascade;
drop view if exists customer_analytics cascade;
drop view if exists product_performance cascade;
drop view if exists referral_performance cascade;

-- Daily sales view
create or replace view daily_sales as
select
  date_trunc('day', created_at) as date,
  count(*) as order_count,
  sum(total) as total_sales,
  avg(total) as avg_order_value,
  sum(discount_amount) as total_discounts
from public.orders
where payment_status = 'paid'
group by date_trunc('day', created_at)
order by date desc;

-- Customer analytics view
create or replace view customer_analytics as
select
  p.id,
  p.full_name,
  p.created_at as registration_date,
  count(distinct o.id) as total_orders,
  coalesce(sum(o.total), 0) as lifetime_value,
  count(distinct r.id) as referrals_made,
  count(distinct uc.id) as coupons_received,
  count(distinct case when uc.is_used then uc.id end) as coupons_used
from public.profiles p
left join public.orders o on o.user_id = p.id and o.payment_status = 'paid'
left join public.referrals r on r.referrer_id = p.id
left join public.user_coupons uc on uc.user_id = p.id
where p.is_admin = false
group by p.id, p.full_name, p.created_at;

-- Product performance view
create or replace view product_performance as
select
  pr.id,
  pr.name,
  pr.slug,
  pr.category,
  pr.price,
  pr.stock,
  count(distinct f.id) as favorites_count,
  pr.rating,
  pr.reviews_count
from public.products pr
left join public.favorites f on f.product_slug = pr.slug
group by pr.id, pr.name, pr.slug, pr.category, pr.price, pr.stock, pr.rating, pr.reviews_count;

-- Referral performance view
create or replace view referral_performance as
select
  p.id as referrer_id,
  p.full_name as referrer_name,
  p.referral_code,
  count(distinct r.id) as total_referrals,
  count(distinct case when r.status = 'completed' then r.id end) as completed_referrals,
  count(distinct case when r.status = 'pending' then r.id end) as pending_referrals
from public.profiles p
left join public.referrals r on r.referrer_id = p.id
where p.is_admin = false
group by p.id, p.full_name, p.referral_code
having count(distinct r.id) > 0
order by total_referrals desc;

-- =====================================================
-- 3. CREATE ANALYTICS FUNCTIONS
-- =====================================================

-- Drop function with CASCADE to handle dependencies
drop function if exists get_top_coupons(integer) cascade;

-- Function to get top performing coupons
create or replace function get_top_coupons(limit_count integer default 10)
returns table (
  id uuid,
  code text,
  discount_type text,
  discount_value numeric,
  uses_count integer,
  max_uses integer,
  is_active boolean,
  created_at timestamp with time zone
)
language sql
stable
as $$
  select
    c.id,
    c.code,
    c.discount_type,
    c.discount_value,
    c.uses_count,
    c.max_uses,
    c.is_active,
    c.created_at
  from public.coupons c
  order by c.uses_count desc
  limit limit_count;
$$;

-- =====================================================
-- 4. GRANT PERMISSIONS ON VIEWS
-- =====================================================

-- Grant select permissions on views to authenticated users
grant select on daily_sales to authenticated;
grant select on customer_analytics to authenticated;
grant select on product_performance to authenticated;
grant select on referral_performance to authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
