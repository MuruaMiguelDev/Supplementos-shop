-- Fix orders RLS policy to allow both authenticated and guest checkouts

-- Drop existing insert policy
drop policy if exists "Users can insert their own orders" on public.orders;

-- Create new policy that allows:
-- 1. Authenticated users to insert orders with their own user_id
-- 2. Guest users to insert orders with null user_id
create policy "Users can insert orders"
  on public.orders for insert
  with check (
    -- Allow if user is authenticated and user_id matches
    (auth.uid() = user_id)
    or
    -- Allow if user is not authenticated and user_id is null (guest checkout)
    (auth.uid() is null and user_id is null)
  );
