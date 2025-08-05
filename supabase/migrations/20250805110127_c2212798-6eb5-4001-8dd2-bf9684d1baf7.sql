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
ADD COLUMN storage_path TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size BIGINT,
ADD COLUMN mime_type TEXT,
ADD COLUMN is_link BOOLEAN DEFAULT false;

-- Criar índices para performance
CREATE INDEX idx_anexos_experimento_id ON public.anexos(experimento_id);
CREATE INDEX idx_anexos_storage_path ON public.anexos(storage_path) WHERE storage_path IS NOT NULL;