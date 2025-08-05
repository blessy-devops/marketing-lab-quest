-- Criar bucket para anexos de experimentos
INSERT INTO storage.buckets (id, name, public) VALUES ('experimento-anexos', 'experimento-anexos', true);

-- Criar políticas para o bucket de anexos
CREATE POLICY "Anexos são públicos" ON storage.objects 
FOR SELECT USING (bucket_id = 'experimento-anexos');

CREATE POLICY "Usuários autenticados podem fazer upload de anexos" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'experimento-anexos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem atualizar seus próprios anexos" ON storage.objects 
FOR UPDATE USING (bucket_id = 'experimento-anexos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Usuários podem deletar seus próprios anexos" ON storage.objects 
FOR DELETE USING (bucket_id = 'experimento-anexos' AND auth.uid() IS NOT NULL);

-- Atualizar tabela anexos para incluir informações de arquivo
ALTER TABLE public.anexos 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS file_name TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS is_link BOOLEAN DEFAULT false;