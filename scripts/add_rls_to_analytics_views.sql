-- Add RLS policies to analytics views
-- Views need RLS enabled to show as "Restricted" in Supabase dashboard

-- Enable RLS on analytics views
alter table if exists public.customer_analytics enable row level security;
alter table if exists public.daily_sales enable row level security;
alter table if exists public.product_performance enable row level security;
alter table if exists public.referral_performance enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Admins can view customer analytics" on public.customer_analytics;
drop policy if exists "Admins can view daily sales" on public.daily_sales;
drop policy if exists "Admins can view product performance" on public.product_performance;
drop policy if exists "Admins can view referral performance" on public.referral_performance;

-- Create policies for customer_analytics view
create policy "Admins can view customer analytics"
  on public.customer_analytics for select
  using (is_admin_user());

-- Create policies for daily_sales view
create policy "Admins can view daily sales"
  on public.daily_sales for select
  using (is_admin_user());

-- Create policies for product_performance view
create policy "Admins can view product performance"
  on public.product_performance for select
  using (is_admin_user());

-- Create policies for referral_performance view
create policy "Admins can view referral performance"
  on public.referral_performance for select
  using (is_admin_user());
