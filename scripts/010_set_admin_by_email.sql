-- Script para hacer administrador a un usuario específico por su email
-- Reemplaza 'tu-email@ejemplo.com' con tu email real

UPDATE profiles
SET is_admin = true
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'tu-email@ejemplo.com'
);

-- Verificar que se actualizó correctamente
SELECT 
  u.email,
  p.full_name,
  p.is_admin,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.is_admin = true;
