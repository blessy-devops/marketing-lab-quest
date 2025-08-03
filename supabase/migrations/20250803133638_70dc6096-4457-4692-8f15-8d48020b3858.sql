-- Disable RLS on all tables and remove all policies
ALTER TABLE public.anexos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.canal_tipo_sugestao DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.experimentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.metricas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtipos_experimento DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_experimento DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view anexos of accessible experimentos" ON public.anexos;
DROP POLICY IF EXISTS "Authenticated users can create anexos" ON public.anexos;
DROP POLICY IF EXISTS "Authenticated users can update anexos" ON public.anexos;
DROP POLICY IF EXISTS "Authenticated users can delete anexos" ON public.anexos;

DROP POLICY IF EXISTS "Authenticated users can view canal_tipo_sugestao" ON public.canal_tipo_sugestao;
DROP POLICY IF EXISTS "Admins can manage canal_tipo_sugestao" ON public.canal_tipo_sugestao;

DROP POLICY IF EXISTS "Users can view comentarios of experiments they can access" ON public.comentarios;
DROP POLICY IF EXISTS "Authenticated users can create comentarios" ON public.comentarios;
DROP POLICY IF EXISTS "Users can update their own comentarios" ON public.comentarios;
DROP POLICY IF EXISTS "Users can delete their own comentarios" ON public.comentarios;

DROP POLICY IF EXISTS "Authenticated users can view experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Authenticated users can create experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Authenticated users can update experimentos" ON public.experimentos;
DROP POLICY IF EXISTS "Authenticated users can delete experimentos" ON public.experimentos;

DROP POLICY IF EXISTS "Users can view metricas of accessible experimentos" ON public.metricas;
DROP POLICY IF EXISTS "Authenticated users can create metricas" ON public.metricas;
DROP POLICY IF EXISTS "Authenticated users can update metricas" ON public.metricas;
DROP POLICY IF EXISTS "Authenticated users can delete metricas" ON public.metricas;

DROP POLICY IF EXISTS "Users can view relevant notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "System can create notifications" ON public.notificacoes;
DROP POLICY IF EXISTS "Users can update notification read status" ON public.notificacoes;

DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view resultados of accessible experimentos" ON public.resultados;
DROP POLICY IF EXISTS "Authenticated users can create resultados" ON public.resultados;
DROP POLICY IF EXISTS "Authenticated users can update resultados" ON public.resultados;
DROP POLICY IF EXISTS "Authenticated users can delete resultados" ON public.resultados;

DROP POLICY IF EXISTS "Authenticated users can view subtipos_experimento" ON public.subtipos_experimento;
DROP POLICY IF EXISTS "Admins can manage subtipos_experimento" ON public.subtipos_experimento;

DROP POLICY IF EXISTS "Authenticated users can view tipos_experimento" ON public.tipos_experimento;
DROP POLICY IF EXISTS "Admins can manage tipos_experimento" ON public.tipos_experimento;

DROP POLICY IF EXISTS "Authenticated users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;