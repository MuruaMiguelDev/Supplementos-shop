-- ============================================
-- SOLUCIÓN DEFINITIVA PARA RECURSIÓN INFINITA
-- ============================================

-- Paso 1: Crear función segura para verificar admin (bypasses RLS)
create or replace function public.is_admin_user(user_id uuid)
returns boolean
language plpgsql
security definer -- Esta función se ejecuta con privilegios del creador, evitando RLS
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and is_admin = true
  );
end;
$$;

-- Paso 2: Eliminar todas las políticas existentes en profiles
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;
drop policy if exists "Admins can delete profiles" on public.profiles;

-- Paso 3: Crear políticas simples sin recursión
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Paso 4: Crear políticas de admin usando la función segura
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin_user(auth.uid()));

create policy "Admins can update all profiles"
  on public.profiles for update
  using (public.is_admin_user(auth.uid()));

create policy "Admins can delete profiles"
  on public.profiles for delete
  using (public.is_admin_user(auth.uid()));

-- Paso 5: Actualizar políticas de otras tablas
-- Favorites
drop policy if exists "Admins can view all favorites" on public.favorites;
create policy "Admins can view all favorites"
  on public.favorites for select
  using (public.is_admin_user(auth.uid()));

drop policy if exists "Admins can manage favorites" on public.favorites;
create policy "Admins can manage favorites"
  on public.favorites for all
  using (public.is_admin_user(auth.uid()));

-- User Coupons
drop policy if exists "Admins can view all user coupons" on public.user_coupons;
create policy "Admins can view all user coupons"
  on public.user_coupons for select
  using (public.is_admin_user(auth.uid()));

drop policy if exists "Admins can manage user coupons" on public.user_coupons;
create policy "Admins can manage user coupons"
  on public.user_coupons for all
  using (public.is_admin_user(auth.uid()));

-- Referrals
drop policy if exists "Admins can manage referrals" on public.referrals;
create policy "Admins can view all referrals"
  on public.referrals for select
  using (public.is_admin_user(auth.uid()));

create policy "Admins can manage referrals"
  on public.referrals for all
  using (public.is_admin_user(auth.uid()));

-- Coupons
drop policy if exists "Admins can manage coupons" on public.coupons;
create policy "Admins can view all coupons"
  on public.coupons for select
  using (public.is_admin_user(auth.uid()));

create policy "Admins can manage coupons"
  on public.coupons for all
  using (public.is_admin_user(auth.uid()));

-- Orders
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin_user(auth.uid()));

create policy "Admins can manage orders"
  on public.orders for all
  using (public.is_admin_user(auth.uid()));
