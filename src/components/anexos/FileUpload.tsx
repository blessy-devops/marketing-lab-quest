import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, FileText, Download, Eye, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Anexo } from '@/hooks/useAnexos';

interface FileUploadProps {
  experimentoId: string;
  anexos: Anexo[];
  onAnexosChange: (anexos: Anexo[]) => void;
}

const ACCEPTED_FILE_TYPES = {
  'image/jpeg': '.jpg,.jpeg',
  'image/png': '.png',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv'
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES_PER_EXPERIMENT = 10;

export function FileUpload({ experimentoId, anexos, onAnexosChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDescription, setLinkDescription] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileAnexos = anexos.filter(a => !a.is_link);
  const linkAnexos = anexos.filter(a => a.is_link);

  const handleFileUpload = async (files: FileList) => {
    if (fileAnexos.length + files.length > MAX_FILES_PER_EXPERIMENT) {
      toast.error(`Máximo de ${MAX_FILES_PER_EXPERIMENT} arquivos por experimento`);
      return;
    }

    setUploading(true);
    const uploadedFiles: Anexo[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tamanho
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`Arquivo ${file.name} é muito grande (máximo 10MB)`);
          continue;
        }

        // Validar tipo
        if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
          toast.error(`Tipo de arquivo ${file.type} não suportado`);
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${experimentoId}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        setUploadProgress((i / files.length) * 100);

        // Upload para Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('experimento-anexos')
          .upload(fileName, file);

        if (uploadError) {
          toast.error(`Erro ao enviar ${file.name}: ${uploadError.message}`);
          continue;
        }

        // Obter URL pública
        const { data: urlData } = supabase.storage
          .from('experimento-anexos')
          .getPublicUrl(fileName);

        // Salvar no banco
        const { data: anexoData, error: anexoError } = await supabase
          .from('anexos')
          .insert({
            experimento_id: experimentoId,
            tipo: file.type.startsWith('image/') ? 'imagem' : 'documento',
            url: urlData.publicUrl,
            storage_path: fileName,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type,
            is_link: false,
            descricao: file.name
          })
          .select()
          .single();

        if (anexoError) {
          toast.error(`Erro ao salvar ${file.name}: ${anexoError.message}`);
          continue;
        }

        uploadedFiles.push(anexoData);
      }

      if (uploadedFiles.length > 0) {
        onAnexosChange([...anexos, ...uploadedFiles]);
        toast.success(`${uploadedFiles.length} arquivo(s) enviado(s) com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro inesperado durante o upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) {
      toast.error('URL é obrigatória');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('anexos')
        .insert({
          experimento_id: experimentoId,
          tipo: 'link',
          url: linkUrl,
          descricao: linkDescription || linkUrl,
          is_link: true
        })
        .select()
        .single();

      if (error) {
        toast.error(`Erro ao salvar link: ${error.message}`);
        return;
      }

      onAnexosChange([...anexos, data]);
      setLinkUrl('');
      setLinkDescription('');
      setShowLinkDialog(false);
      toast.success('Link adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro inesperado ao salvar link');
    }
  };

  const handleDeleteAnexo = async (anexo: Anexo) => {
    try {
      // Deletar do banco
      const { error: dbError } = await supabase
        .from('anexos')
        .delete()
        .eq('id', anexo.id);

      if (dbError) {
        toast.error(`Erro ao deletar: ${dbError.message}`);
        return;
      }

      // Se for arquivo, deletar do storage
      if (!anexo.is_link && anexo.storage_path) {
        const { error: storageError } = await supabase.storage
          .from('experimento-anexos')
          .remove([anexo.storage_path]);

        if (storageError) {
          console.warn('Erro ao deletar do storage:', storageError);
        }
      }

      onAnexosChange(anexos.filter(a => a.id !== anexo.id));
      toast.success('Anexo removido com sucesso!');
    } catch (error) {
      toast.error('Erro inesperado ao deletar anexo');
    }
  };

  const getFileIcon = (anexo: Anexo) => {
    if (anexo.is_link) return LinkIcon;
    if (anexo.mime_type?.startsWith('image/')) return ImageIcon;
    return FileText;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (anexo: Anexo) => anexo.mime_type?.startsWith('image/');

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Anexos ({anexos.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Enviar Arquivos</Label>
            <div className="mt-2 flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || fileAnexos.length >= MAX_FILES_PER_EXPERIMENT}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Arquivos
              </Button>
              <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Adicionar Link
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Link</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="link-url">URL *</Label>
                      <Input
                        id="link-url"
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="link-description">Descrição</Label>
                      <Input
                        id="link-description"
                        value={linkDescription}
                        onChange={(e) => setLinkDescription(e.target.value)}
                        placeholder="Descrição do link"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleLinkSubmit} className="flex-1">
                        Adicionar
                      </Button>
                      <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.values(ACCEPTED_FILE_TYPES).join(',')}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            {uploading && (
              <div className="mt-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground mt-1">
                  Enviando... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-2">
              Suportados: Imagens (JPG, PNG, GIF), PDF, Excel (XLSX), CSV • Máximo: 10MB por arquivo, {MAX_FILES_PER_EXPERIMENT} arquivos por experimento
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Anexos List */}
      {anexos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Arquivos Anexados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {anexos.map((anexo) => {
                const FileIcon = getFileIcon(anexo);
                const isImg = isImage(anexo);
                
                return (
                  <div key={anexo.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {anexo.file_name || anexo.descricao}
                          </p>
                          {anexo.file_size && (
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(anexo.file_size)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnexo(anexo)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Thumbnail para imagens */}
                    {isImg && anexo.url && (
                      <div className="relative">
                        <img
                          src={anexo.url}
                          alt={anexo.file_name || 'Imagem'}
                          className="w-full h-24 object-cover rounded cursor-pointer"
                          onClick={() => setSelectedImage(anexo.url)}
                        />
                        <Badge className="absolute bottom-1 right-1 text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Badge>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {isImg ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedImage(anexo.url)}
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Visualizar
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(anexo.url, '_blank')}
                          className="flex-1"
                        >
                          {anexo.is_link ? <LinkIcon className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                          {anexo.is_link ? 'Abrir' : 'Download'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualizar Imagem</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="flex justify-center">
              <img
                src={selectedImage}
                alt="Imagem em tamanho real"
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}