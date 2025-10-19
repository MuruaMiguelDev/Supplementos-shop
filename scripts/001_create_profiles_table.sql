-- Create profiles table that references auth.users
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
  is_admin boolean default false, -- Added is_admin column here to avoid separate migration
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies before creating to avoid "already exists" errors
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create index for referral code lookups
create index if not exists profiles_referral_code_idx on public.profiles(referral_code);
create index if not exists idx_profiles_is_admin on public.profiles(is_admin); -- Added admin index

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
    -- Generate 8 character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    select count(*) > 0 into exists
    from public.profiles
    where referral_code = code;
    
    exit when not exists;
  end loop;
  
  return code;
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
  -- Extract referred_by from user metadata if present
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

-- Drop trigger if exists and create new one
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

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

-- Trigger to auto-update updated_at
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();
