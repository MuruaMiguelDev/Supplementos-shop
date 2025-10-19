-- =====================================================
-- COMPLETE DATABASE SETUP
-- This script sets up the entire database in the correct order
-- =====================================================

-- =====================================================
-- 1. CREATE HELPER FUNCTIONS
-- =====================================================

-- Drop existing function if it exists
drop function if exists is_admin_user();

-- Create function to check if current user is admin (bypasses RLS)
create or replace function is_admin_user()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
    and is_admin = true
  );
$$;

-- =====================================================
-- 2. DROP EXISTING POLICIES (to avoid conflicts)
-- =====================================================

-- Profiles policies
drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;
drop policy if exists "Admins can update all profiles" on public.profiles;

-- Favorites policies
drop policy if exists "Users can view their own favorites" on public.favorites;
drop policy if exists "Users can insert their own favorites" on public.favorites;
drop policy if exists "Users can delete their own favorites" on public.favorites;
drop policy if exists "Admins can view all favorites" on public.favorites;

-- Coupons policies
drop policy if exists "Anyone can view active coupons" on public.coupons;
drop policy if exists "Admins can view all coupons" on public.coupons;
drop policy if exists "Admins can insert coupons" on public.coupons;
drop policy if exists "Admins can update coupons" on public.coupons;
drop policy if exists "Admins can delete coupons" on public.coupons;

-- User coupons policies
drop policy if exists "Users can view their own coupons" on public.user_coupons;
drop policy if exists "Users can update their own coupons" on public.user_coupons;
drop policy if exists "Admins can view all user coupons" on public.user_coupons;
drop policy if exists "Admins can manage all user coupons" on public.user_coupons;

-- Referrals policies
drop policy if exists "Users can view their referrals" on public.referrals;
drop policy if exists "Admins can view all referrals" on public.referrals;

-- Orders policies
drop policy if exists "Users can view their own orders" on public.orders;
drop policy if exists "Users can insert their own orders" on public.orders;
drop policy if exists "Admins can view all orders" on public.orders;
drop policy if exists "Admins can update all orders" on public.orders;

-- =====================================================
-- 3. RECREATE POLICIES WITH CORRECT LOGIC
-- =====================================================

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (is_admin_user());

create policy "Admins can update all profiles"
  on public.profiles for update
  using (is_admin_user());

-- Favorites policies
create policy "Users can view their own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

create policy "Admins can view all favorites"
  on public.favorites for select
  using (is_admin_user());

-- Coupons policies
create policy "Anyone can view active coupons"
  on public.coupons for select
  using (is_active = true and (expires_at is null or expires_at > now()));

create policy "Admins can view all coupons"
  on public.coupons for select
  using (is_admin_user());

create policy "Admins can insert coupons"
  on public.coupons for insert
  with check (is_admin_user());

create policy "Admins can update coupons"
  on public.coupons for update
  using (is_admin_user());

create policy "Admins can delete coupons"
  on public.coupons for delete
  using (is_admin_user());

-- User coupons policies
create policy "Users can view their own coupons"
  on public.user_coupons for select
  using (auth.uid() = user_id);

create policy "Users can update their own coupons"
  on public.user_coupons for update
  using (auth.uid() = user_id);

create policy "Admins can view all user coupons"
  on public.user_coupons for select
  using (is_admin_user());

create policy "Admins can manage all user coupons"
  on public.user_coupons for all
  using (is_admin_user());

-- Referrals policies
create policy "Users can view their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id or auth.uid() = referee_id);

create policy "Admins can view all referrals"
  on public.referrals for select
  using (is_admin_user());

-- Orders policies
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can view all orders"
  on public.orders for select
  using (is_admin_user());

create policy "Admins can update all orders"
  on public.orders for update
  using (is_admin_user());

-- =====================================================
-- 4. CREATE PRODUCTS TABLE
-- =====================================================

-- Drop table if exists
drop table if exists public.products cascade;

-- Create products table
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  image text not null,
  category text not null,
  subcategory text,
  brand text,
  stock integer default 0,
  is_featured boolean default false,
  is_new boolean default false,
  rating numeric(2, 1) default 0,
  reviews_count integer default 0,
  tags text[],
  benefits text[],
  ingredients text[],
  usage_instructions text,
  warnings text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for better performance
create index products_slug_idx on public.products(slug);
create index products_category_idx on public.products(category);
create index products_is_featured_idx on public.products(is_featured);
create index products_is_new_idx on public.products(is_new);
create index products_created_at_idx on public.products(created_at desc);

-- Enable RLS
alter table public.products enable row level security;

-- Products policies (read-only for everyone, write for admins)
create policy "Anyone can view products"
  on public.products for select
  using (true);

create policy "Admins can insert products"
  on public.products for insert
  with check (is_admin_user());

create policy "Admins can update products"
  on public.products for update
  using (is_admin_user());

create policy "Admins can delete products"
  on public.products for delete
  using (is_admin_user());

-- =====================================================
-- 5. INSERT PRODUCT DATA
-- =====================================================

insert into public.products (name, slug, description, price, compare_at_price, image, category, subcategory, brand, stock, is_featured, is_new, rating, reviews_count, tags, benefits, ingredients, usage_instructions, warnings) values
(
  'Whey Protein Isolate',
  'whey-protein-isolate',
  'Proteína de suero aislada de alta calidad con 25g de proteína por porción. Ideal para el desarrollo muscular y recuperación post-entrenamiento.',
  899.00,
  1299.00,
  '/placeholder.svg?height=400&width=400',
  'Proteínas',
  'Whey Protein',
  'NutriMax',
  150,
  true,
  false,
  4.8,
  324,
  ARRAY['proteína', 'músculo', 'recuperación', 'whey'],
  ARRAY['25g de proteína por porción', 'Bajo en carbohidratos y grasas', 'Rápida absorción', 'Sabor delicioso'],
  ARRAY['Proteína de suero aislada', 'Lecitina de soya', 'Saborizantes naturales', 'Stevia'],
  'Mezclar 1 scoop (30g) con 250ml de agua o leche. Consumir después del entrenamiento o entre comidas.',
  'No exceder la dosis recomendada. Consultar con un médico antes de usar si está embarazada o tiene alguna condición médica.'
),
(
  'Creatina Monohidrato',
  'creatina-monohidrato',
  'Creatina monohidrato micronizada de máxima pureza. Aumenta la fuerza, potencia y masa muscular.',
  599.00,
  799.00,
  '/placeholder.svg?height=400&width=400',
  'Creatina',
  'Monohidrato',
  'PowerLift',
  200,
  true,
  false,
  4.9,
  567,
  ARRAY['creatina', 'fuerza', 'potencia', 'músculo'],
  ARRAY['5g de creatina pura por porción', 'Micronizada para mejor absorción', 'Sin sabor', 'Aumenta fuerza y potencia'],
  ARRAY['Creatina monohidrato micronizada 100%'],
  'Tomar 5g (1 cucharada) diariamente. Puede mezclarse con agua, jugo o tu batido de proteína favorito.',
  'Mantener fuera del alcance de los niños. Consultar con un profesional de la salud antes de usar.'
),
(
  'Pre-Workout Extreme',
  'pre-workout-extreme',
  'Fórmula pre-entrenamiento avanzada con cafeína, beta-alanina y citrulina para máxima energía y rendimiento.',
  749.00,
  999.00,
  '/placeholder.svg?height=400&width=400',
  'Pre-Entreno',
  'Con Estimulantes',
  'EnergyMax',
  120,
  true,
  true,
  4.7,
  289,
  ARRAY['pre-entreno', 'energía', 'rendimiento', 'cafeína'],
  ARRAY['200mg de cafeína por porción', 'Beta-alanina para resistencia', 'Citrulina para mejor bombeo', 'Enfoque mental mejorado'],
  ARRAY['Cafeína anhidra', 'Beta-alanina', 'L-citrulina', 'Taurina', 'Vitaminas B'],
  'Mezclar 1 scoop con 300ml de agua 20-30 minutos antes del entrenamiento. No consumir después de las 6pm.',
  'Contiene cafeína. No recomendado para menores de 18 años, embarazadas o personas sensibles a estimulantes.'
),
(
  'BCAA 2:1:1',
  'bcaa-211',
  'Aminoácidos de cadena ramificada en proporción 2:1:1 para prevenir el catabolismo muscular y mejorar la recuperación.',
  649.00,
  849.00,
  '/placeholder.svg?height=400&width=400',
  'Aminoácidos',
  'BCAA',
  'RecoveryPro',
  180,
  false,
  false,
  4.6,
  412,
  ARRAY['bcaa', 'aminoácidos', 'recuperación', 'anticatabólico'],
  ARRAY['5g de BCAA por porción', 'Proporción óptima 2:1:1', 'Sin azúcar', 'Sabores refrescantes'],
  ARRAY['L-leucina', 'L-isoleucina', 'L-valina', 'Saborizantes naturales', 'Ácido cítrico'],
  'Tomar 1 porción durante el entrenamiento o entre comidas. Puede consumirse hasta 3 veces al día.',
  'Mantener en un lugar fresco y seco. No sustituye una dieta equilibrada.'
),
(
  'Multivitamínico Completo',
  'multivitaminico-completo',
  'Complejo multivitamínico y mineral completo con 25 nutrientes esenciales para apoyar tu salud general.',
  449.00,
  599.00,
  '/placeholder.svg?height=400&width=400',
  'Vitaminas',
  'Multivitamínicos',
  'HealthPlus',
  250,
  false,
  false,
  4.5,
  198,
  ARRAY['vitaminas', 'minerales', 'salud', 'inmunidad'],
  ARRAY['25 vitaminas y minerales', 'Apoya el sistema inmune', 'Mejora energía y vitalidad', '1 cápsula al día'],
  ARRAY['Vitaminas A, C, D, E, K', 'Complejo B', 'Zinc', 'Magnesio', 'Calcio', 'Hierro'],
  'Tomar 1 cápsula al día con alimentos.',
  'No exceder la dosis recomendada. Consultar con un médico si está tomando medicamentos.'
),
(
  'Omega-3 Fish Oil',
  'omega-3-fish-oil',
  'Aceite de pescado de alta concentración con EPA y DHA para salud cardiovascular y cerebral.',
  549.00,
  699.00,
  '/placeholder.svg?height=400&width=400',
  'Vitaminas',
  'Omega-3',
  'PureHealth',
  300,
  false,
  false,
  4.7,
  276,
  ARRAY['omega-3', 'epa', 'dha', 'corazón', 'cerebro'],
  ARRAY['1000mg de aceite de pescado', 'Alto en EPA y DHA', 'Pureza molecular garantizada', 'Sin sabor a pescado'],
  ARRAY['Aceite de pescado concentrado', 'EPA (ácido eicosapentaenoico)', 'DHA (ácido docosahexaenoico)', 'Vitamina E'],
  'Tomar 2 cápsulas al día con alimentos.',
  'Consultar con un médico si está tomando anticoagulantes. Mantener refrigerado después de abrir.'
),
(
  'Glutamina Pura',
  'glutamina-pura',
  'L-Glutamina pura para mejorar la recuperación muscular y apoyar el sistema inmunológico.',
  499.00,
  649.00,
  '/placeholder.svg?height=400&width=400',
  'Aminoácidos',
  'Glutamina',
  'RecoveryPro',
  160,
  false,
  true,
  4.4,
  145,
  ARRAY['glutamina', 'recuperación', 'inmunidad', 'intestino'],
  ARRAY['5g de L-glutamina por porción', '100% pura', 'Sin sabor', 'Apoya recuperación e inmunidad'],
  ARRAY['L-glutamina 100%'],
  'Mezclar 5g (1 cucharada) con agua o tu bebida favorita. Tomar después del entrenamiento o antes de dormir.',
  'Mantener fuera del alcance de los niños. Consultar con un profesional de la salud antes de usar.'
),
(
  'Quemador de Grasa Termogénico',
  'quemador-grasa-termogenico',
  'Fórmula termogénica avanzada con extractos naturales para acelerar el metabolismo y quemar grasa.',
  799.00,
  1099.00,
  '/placeholder.svg?height=400&width=400',
  'Pérdida de Peso',
  'Termogénicos',
  'SlimFit',
  100,
  true,
  true,
  4.3,
  234,
  ARRAY['quemador', 'termogénico', 'metabolismo', 'pérdida de peso'],
  ARRAY['Acelera el metabolismo', 'Aumenta la energía', 'Suprime el apetito', 'Con extractos naturales'],
  ARRAY['Extracto de té verde', 'Cafeína', 'L-carnitina', 'Extracto de garcinia cambogia', 'Pimienta negra'],
  'Tomar 2 cápsulas 30 minutos antes del desayuno. No exceder 2 cápsulas al día.',
  'Contiene cafeína. No recomendado para menores de 18 años, embarazadas o personas con problemas cardíacos.'
),
(
  'Proteína Vegana',
  'proteina-vegana',
  'Proteína vegetal de múltiples fuentes con 24g de proteína por porción. Ideal para veganos y vegetarianos.',
  849.00,
  1199.00,
  '/placeholder.svg?height=400&width=400',
  'Proteínas',
  'Vegana',
  'PlantPower',
  130,
  false,
  true,
  4.6,
  187,
  ARRAY['proteína', 'vegana', 'plant-based', 'vegetariana'],
  ARRAY['24g de proteína vegetal', 'Mezcla de múltiples fuentes', 'Rico en aminoácidos', 'Sin lactosa ni gluten'],
  ARRAY['Proteína de guisante', 'Proteína de arroz', 'Proteína de hemp', 'Saborizantes naturales', 'Stevia'],
  'Mezclar 1 scoop (35g) con 300ml de agua, leche vegetal o tu bebida favorita.',
  'Mantener en un lugar fresco y seco. No sustituye una dieta equilibrada.'
),
(
  'ZMA (Zinc, Magnesio, B6)',
  'zma-zinc-magnesio-b6',
  'Combinación de zinc, magnesio y vitamina B6 para mejorar la recuperación, el sueño y los niveles de testosterona.',
  399.00,
  549.00,
  '/placeholder.svg?height=400&width=400',
  'Vitaminas',
  'Minerales',
  'SleepMax',
  220,
  false,
  false,
  4.5,
  312,
  ARRAY['zma', 'zinc', 'magnesio', 'sueño', 'testosterona'],
  ARRAY['Mejora la calidad del sueño', 'Apoya niveles de testosterona', 'Acelera la recuperación', 'Reduce calambres musculares'],
  ARRAY['Zinc', 'Magnesio', 'Vitamina B6'],
  'Tomar 3 cápsulas 30-60 minutos antes de dormir con el estómago vacío.',
  'No tomar con productos lácteos ya que pueden interferir con la absorción.'
),
(
  'Colágeno Hidrolizado',
  'colageno-hidrolizado',
  'Colágeno hidrolizado tipo I y III para salud de piel, cabello, uñas y articulaciones.',
  699.00,
  899.00,
  '/placeholder.svg?height=400&width=400',
  'Vitaminas',
  'Colágeno',
  'BeautyHealth',
  170,
  false,
  false,
  4.8,
  423,
  ARRAY['colágeno', 'piel', 'articulaciones', 'cabello', 'uñas'],
  ARRAY['10g de colágeno por porción', 'Tipo I y III', 'Mejora elasticidad de la piel', 'Apoya salud articular'],
  ARRAY['Colágeno hidrolizado bovino', 'Vitamina C'],
  'Mezclar 10g (1 scoop) con agua, jugo o café. Tomar diariamente preferiblemente en ayunas.',
  'Mantener en un lugar fresco y seco. Consultar con un médico si está embarazada.'
),
(
  'Cafeína 200mg',
  'cafeina-200mg',
  'Cápsulas de cafeína pura para aumentar energía, enfoque y rendimiento físico.',
  299.00,
  399.00,
  '/placeholder.svg?height=400&width=400',
  'Pre-Entreno',
  'Estimulantes',
  'EnergyBoost',
  280,
  false,
  false,
  4.4,
  156,
  ARRAY['cafeína', 'energía', 'enfoque', 'rendimiento'],
  ARRAY['200mg de cafeína por cápsula', 'Aumenta energía y alerta', 'Mejora rendimiento físico', 'Fácil de dosificar'],
  ARRAY['Cafeína anhidra'],
  'Tomar 1 cápsula 30 minutos antes del entrenamiento o cuando necesites energía. No exceder 2 cápsulas al día.',
  'No consumir después de las 6pm. No recomendado para menores de 18 años, embarazadas o personas sensibles a la cafeína.'
);
