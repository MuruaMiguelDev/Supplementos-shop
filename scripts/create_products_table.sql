-- Create products table
create table if not exists public.products (
  id text primary key,
  slug text unique not null,
  name text not null,
  brand text,
  description text,
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  tags text[],
  categories text[],
  flavors text[],
  rating numeric(3, 2),
  reviews_count integer default 0,
  images text[],
  stock integer default 0,
  in_stock boolean generated always as (stock > 0) stored,
  meta jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for better query performance
create index if not exists products_slug_idx on public.products(slug);
create index if not exists products_brand_idx on public.products(brand);
create index if not exists products_categories_idx on public.products using gin(categories);
create index if not exists products_price_idx on public.products(price);
create index if not exists products_rating_idx on public.products(rating);
create index if not exists products_stock_idx on public.products(stock);

-- Enable RLS
alter table public.products enable row level security;

-- RLS Policies: Everyone can read products
create policy "Anyone can view products"
  on public.products for select
  using (true);

-- Only admins can insert products
create policy "Admins can insert products"
  on public.products for insert
  with check (is_admin_user());

-- Only admins can update products
create policy "Admins can update products"
  on public.products for update
  using (is_admin_user());

-- Only admins can delete products
create policy "Admins can delete products"
  on public.products for delete
  using (is_admin_user());

-- Insert mock products data
insert into public.products (id, slug, name, brand, description, price, compare_at_price, tags, categories, flavors, rating, reviews_count, images, stock, meta) values
('1', 'proteina-whey-chocolate', 'Proteína Whey Isolate', 'ProFit', 'Proteína de suero aislada de alta calidad con 25g de proteína por porción.', 49.99, 59.99, ARRAY['proteína', 'músculo', 'recuperación'], ARRAY['Proteínas'], ARRAY['Chocolate', 'Vainilla', 'Fresa'], 4.8, 234, ARRAY['/protein-powder-chocolate.jpg', '/protein-powder-scoop.png'], 50, '{"servings": 30, "protein_per_serving": 25}'::jsonb),
('2', 'creatina-monohidrato', 'Creatina Monohidrato', 'MaxPower', 'Creatina pura micronizada para aumentar fuerza y masa muscular.', 29.99, null, ARRAY['creatina', 'fuerza', 'rendimiento'], ARRAY['Creatina'], null, 4.9, 456, ARRAY['/creatine-powder.png', '/creatine-supplement.jpg'], 100, '{"servings": 60, "creatine_per_serving": 5}'::jsonb),
('3', 'pre-entreno-energia', 'Pre-Entreno Extreme Energy', 'EnergyMax', 'Fórmula avanzada con cafeína, beta-alanina y citrulina para máxima energía.', 39.99, 49.99, ARRAY['pre-entreno', 'energía', 'rendimiento'], ARRAY['Pre-Entreno'], ARRAY['Frutas Tropicales', 'Sandía', 'Uva'], 4.7, 189, ARRAY['/pre-workout-powder-tropical.jpg', '/pre-workout-energy-drink.jpg'], 75, '{"servings": 30, "caffeine_mg": 200}'::jsonb),
('4', 'bcaa-recuperacion', 'BCAA 2:1:1', 'RecoveryPro', 'Aminoácidos ramificados para recuperación muscular y reducción de fatiga.', 34.99, null, ARRAY['bcaa', 'recuperación', 'aminoácidos'], ARRAY['Aminoácidos'], ARRAY['Limón', 'Naranja', 'Mango'], 4.6, 312, ARRAY['/bcaa-powder-lemon.jpg', '/bcaa-amino-acids.jpg'], 60, '{"servings": 40, "bcaa_per_serving": 7}'::jsonb),
('5', 'glutamina-pura', 'L-Glutamina', 'PureFit', 'Glutamina pura para recuperación muscular y soporte inmunológico.', 24.99, null, ARRAY['glutamina', 'recuperación', 'inmunidad'], ARRAY['Aminoácidos'], null, 4.5, 145, ARRAY['/glutamine-powder.jpg', '/glutamine-supplement.jpg'], 80, '{"servings": 50, "glutamine_per_serving": 5}'::jsonb),
('6', 'omega-3-capsulas', 'Omega-3 Fish Oil', 'HealthPlus', 'Aceite de pescado de alta concentración con EPA y DHA.', 19.99, null, ARRAY['omega-3', 'salud', 'corazón'], ARRAY['Salud General'], null, 4.7, 278, ARRAY['/omega-3-capsules.png', '/omega-3-supplement.png'], 120, '{"servings": 90, "epa_dha_mg": 1000}'::jsonb),
('7', 'multivitaminico-deportivo', 'Multivitamínico Deportivo', 'VitaMax', 'Complejo vitamínico completo diseñado para atletas.', 27.99, null, ARRAY['vitaminas', 'salud', 'rendimiento'], ARRAY['Vitaminas'], null, 4.6, 201, ARRAY['/multivitamin-sports-tablets.jpg', '/vitamin-supplement-bottle.jpg'], 90, '{"servings": 60, "tablets_per_serving": 2}'::jsonb),
('8', 'quemador-grasa', 'Quemador de Grasa Termogénico', 'LeanBody', 'Fórmula termogénica avanzada para acelerar el metabolismo.', 44.99, 54.99, ARRAY['quemador', 'pérdida de peso', 'termogénico'], ARRAY['Pérdida de Peso'], null, 4.4, 167, ARRAY['/fat-burner-capsules.jpg', '/thermogenic-supplement.jpg'], 45, '{"servings": 30, "capsules_per_serving": 2}'::jsonb),
('9', 'proteina-vegana', 'Proteína Vegana Orgánica', 'PlantPower', 'Proteína vegetal de guisante y arroz integral, 100% orgánica.', 42.99, null, ARRAY['proteína', 'vegano', 'orgánico'], ARRAY['Proteínas'], ARRAY['Chocolate', 'Vainilla', 'Natural'], 4.5, 198, ARRAY['/vegan-protein-powder-chocolate.jpg', '/plant-based-protein.jpg'], 55, '{"servings": 30, "protein_per_serving": 22}'::jsonb),
('10', 'colageno-hidrolizado', 'Colágeno Hidrolizado', 'BeautyFit', 'Colágeno tipo I y III para piel, cabello, uñas y articulaciones.', 32.99, null, ARRAY['colágeno', 'belleza', 'articulaciones'], ARRAY['Salud General'], null, 4.8, 289, ARRAY['/collagen-powder.png', '/hydrolyzed-collagen.jpg'], 70, '{"servings": 30, "collagen_per_serving": 10}'::jsonb),
('11', 'zma-recuperacion-nocturna', 'ZMA Recovery', 'NightPro', 'Zinc, magnesio y vitamina B6 para recuperación y mejor sueño.', 22.99, null, ARRAY['zma', 'recuperación', 'sueño'], ARRAY['Recuperación'], null, 4.6, 156, ARRAY['/zma-capsules.jpg', '/placeholder.svg?height=600&width=600'], 85, '{"servings": 60, "capsules_per_serving": 3}'::jsonb),
('12', 'barras-proteicas', 'Barras Proteicas Mix', 'SnackFit', 'Pack de 12 barras con 20g de proteína cada una.', 29.99, null, ARRAY['proteína', 'snack', 'conveniente'], ARRAY['Snacks'], ARRAY['Chocolate', 'Caramelo', 'Cookies & Cream'], 4.7, 423, ARRAY['/placeholder.svg?height=600&width=600', '/placeholder.svg?height=600&width=600'], 150, '{"bars_per_box": 12, "protein_per_bar": 20}'::jsonb)
on conflict (id) do nothing;
