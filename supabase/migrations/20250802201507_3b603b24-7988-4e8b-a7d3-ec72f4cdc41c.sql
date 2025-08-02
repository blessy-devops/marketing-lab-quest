-- Clean up conflicting RLS policies and fix access issues
-- Remove conflicting public access policies

-- Drop old conflicting policies for tipos_experimento
DROP POLICY IF EXISTS "Allow public access to tipos_experimento" ON public.tipos_experimento;

-- Drop old conflicting policies for subtipos_experimento  
DROP POLICY IF EXISTS "Allow public access to subtipos_experimento" ON public.subtipos_experimento;

-- Drop old conflicting policies for canal_tipo_sugestao
DROP POLICY IF EXISTS "Allow public access to canal_tipo_sugestao" ON public.canal_tipo_sugestao;

-- Ensure user_roles table has proper policies for authentication to work
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;

-- Create comprehensive user_roles policies
CREATE POLICY "Authenticated users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Admins can manage all user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role))
WITH CHECK (has_role(auth.uid(), 'admin'::user_role));