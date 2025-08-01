-- Update password for existing user
UPDATE auth.users 
SET encrypted_password = crypt('Dl312813!', gen_salt('bf')),
    updated_at = now()
WHERE email = 'davi@useblessy.com.br';

-- Update profile based on email
UPDATE public.profiles 
SET nome_completo = 'Davi Luis',
    departamento = 'Comercial',
    cargo = 'Diretor de receitas',
    ativo = true,
    updated_at = now()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'davi@useblessy.com.br');

-- Ensure admin role exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'davi@useblessy.com.br'
ON CONFLICT (user_id, role) DO NOTHING;