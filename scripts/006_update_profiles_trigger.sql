-- Drop and recreate the handle_new_user function with referred_by support
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that handles referred_by from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  referrer_code TEXT;
BEGIN
  -- Extract referred_by from user metadata if it exists
  referrer_code := NEW.raw_user_meta_data->>'referred_by';
  
  -- Insert profile with referred_by if provided
  INSERT INTO public.profiles (id, email, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    referrer_code
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
