-- Only create views if orders table exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    -- Create view for daily sales analytics
    CREATE OR REPLACE VIEW daily_sales AS
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as total_orders,
      SUM(total) as total_revenue,
      AVG(total) as average_order_value,
      SUM(discount_amount) as total_discounts
    FROM orders
    WHERE payment_status = 'paid'
    GROUP BY DATE(created_at)
    ORDER BY date DESC;

    -- Create view for product performance
    CREATE OR REPLACE VIEW product_performance AS
    SELECT 
      item->>'product_id' as product_id,
      item->>'name' as product_name,
      COUNT(*) as times_ordered,
      SUM((item->>'quantity')::INTEGER) as total_quantity,
      SUM((item->>'price')::DECIMAL * (item->>'quantity')::INTEGER) as total_revenue
    FROM orders,
    JSONB_ARRAY_ELEMENTS(items) as item
    WHERE payment_status = 'paid'
    GROUP BY item->>'product_id', item->>'name'
    ORDER BY total_revenue DESC;

    -- Create view for customer analytics
    CREATE OR REPLACE VIEW customer_analytics AS
    SELECT 
      user_id,
      customer_email,
      customer_name,
      COUNT(*) as total_orders,
      SUM(total) as lifetime_value,
      AVG(total) as average_order_value,
      MAX(created_at) as last_order_date,
      MIN(created_at) as first_order_date
    FROM orders
    WHERE payment_status = 'paid'
    GROUP BY user_id, customer_email, customer_name
    ORDER BY lifetime_value DESC;

    -- Create view for referral performance
    CREATE OR REPLACE VIEW referral_performance AS
    SELECT 
      p.id as referrer_id,
      p.full_name as referrer_name,
      p.referral_code,
      COUNT(r.id) as total_referrals,
      COUNT(CASE WHEN r.converted = TRUE THEN 1 END) as converted_referrals,
      COALESCE(SUM(o.total), 0) as referral_revenue
    FROM profiles p
    LEFT JOIN referrals r ON p.id = r.referrer_id
    LEFT JOIN orders o ON r.referee_id = o.user_id AND o.payment_status = 'paid'
    GROUP BY p.id, p.full_name, p.referral_code
    HAVING COUNT(r.id) > 0
    ORDER BY total_referrals DESC;
  END IF;
END $$;
