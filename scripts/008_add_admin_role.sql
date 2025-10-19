-- Skip adding is_admin column since it's now in the profiles table creation
-- This script now only adds admin policies

-- Drop existing admin policies before creating
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete any profile" ON profiles;

-- Admin users can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin users can update any profile
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Admin users can delete any profile
CREATE POLICY "Admins can delete any profile"
  ON profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only create order policies if orders table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
    DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
    
    CREATE POLICY "Admins can view all orders"
      ON orders FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );

    CREATE POLICY "Admins can update all orders"
      ON orders FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Only create favorites policies if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'favorites') THEN
    DROP POLICY IF EXISTS "Admins can view all favorites" ON favorites;
    
    CREATE POLICY "Admins can view all favorites"
      ON favorites FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Only create referrals policies if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'referrals') THEN
    DROP POLICY IF EXISTS "Admins can view all referrals" ON referrals;
    
    CREATE POLICY "Admins can view all referrals"
      ON referrals FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Only create coupons policies if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'coupons') THEN
    DROP POLICY IF EXISTS "Admins can view all coupons" ON coupons;
    DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
    
    CREATE POLICY "Admins can view all coupons"
      ON coupons FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );

    CREATE POLICY "Admins can manage coupons"
      ON coupons FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );
  END IF;
END $$;

-- Only create user_coupons policies if table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_coupons') THEN
    DROP POLICY IF EXISTS "Admins can view all user coupons" ON user_coupons;
    
    CREATE POLICY "Admins can view all user coupons"
      ON user_coupons FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND is_admin = TRUE
        )
      );
  END IF;
END $$;
