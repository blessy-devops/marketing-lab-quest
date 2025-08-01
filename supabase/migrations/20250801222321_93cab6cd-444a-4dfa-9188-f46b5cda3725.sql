-- Update existing user password and profile
DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Get the user ID
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'davi@useblessy.com.br';
    
    -- Update password
    UPDATE auth.users 
    SET encrypted_password = crypt('Dl312813!', gen_salt('bf')),
        updated_at = now()
    WHERE email = 'davi@useblessy.com.br';
    
    -- Update or insert profile
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
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        nome_completo = 'Davi Luis',
        departamento = 'Comercial',
        cargo = 'Diretor de receitas',
        ativo = true,
        updated_at = now();
    
    -- Update or insert admin role
    INSERT INTO public.user_roles (
        user_id,
        role
    ) VALUES (
        user_uuid,
        'admin'
    )
    ON CONFLICT (user_id, role) 
    DO NOTHING;
END $$;