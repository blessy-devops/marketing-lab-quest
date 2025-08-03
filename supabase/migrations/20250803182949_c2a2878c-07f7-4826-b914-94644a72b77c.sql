-- Adicionar foreign key para relacionar comentários com profiles
ALTER TABLE public.comentarios 
ADD CONSTRAINT comentarios_usuario_id_fkey 
FOREIGN KEY (usuario_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;