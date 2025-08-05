-- Habilitar RLS nas tabelas de usuários
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Política para profiles: todos podem ver profiles de usuários ativos
CREATE POLICY "Authenticated users can view active profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (ativo = true);

-- Política para profiles: usuários podem editar apenas seu próprio perfil
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

-- Política para user_roles: todos podem ver roles
CREATE POLICY "Authenticated users can view user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (true);

-- Política para user_roles: apenas admins podem atualizar roles
CREATE POLICY "Admins can update user roles" 
ON public.user_roles 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Política para user_roles: apenas admins podem inserir novos roles
CREATE POLICY "Admins can insert user roles" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);