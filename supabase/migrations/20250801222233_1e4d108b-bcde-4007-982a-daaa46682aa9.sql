-- Create user directly in auth.users table
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'davi@useblessy.com.br',
  crypt('Dl312813!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Davi Luis"}',
  false,
  'authenticated'
);

-- Get the user ID we just created and insert profile/role
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'davi@useblessy.com.br';
    
    -- Insert profile
    INSERT INTO public.profiles (
        user_id,
        nome_completo,
        departamento,
        cargo,
        ativo
    ) VALUES (
        user_uuid,
        'Davi Luis',
        'Comercial',
        'Diretor de receitas',
        true
    );
    
    -- Assign admin role
    INSERT INTO public.user_roles (
        user_id,
        role
    ) VALUES (
        user_uuid,
        'admin'
    );
END $$;