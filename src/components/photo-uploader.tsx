
"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, FileImage, X, Loader2, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { uploadPhotos } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
    albumId: string;
}

type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadFile {
    file: File;
    preview: string;
    status: UploadStatus;
    error?: string;
}

export function PhotoUploader({ albumId }: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [totalFilesUploaded, setTotalFilesUploaded] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending',
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    disabled: isUploading,
  });

  useEffect(() => {
    // Inicia o upload automaticamente quando novos arquivos são adicionados
    if (files.some(f => f.status === 'pending') && !isUploading) {
        handleUpload();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);


  const handleUpload = async () => {
    const filesToUpload = files.filter(f => f.status === 'pending');
    if (filesToUpload.length === 0) {
        return;
    }
    
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    filesToUpload.forEach(f => formData.append('photos', f.file));
    
    // Marca arquivos como 'uploading'
    setFiles(prev => prev.map(f => f.status === 'pending' ? {...f, status: 'uploading'} : f));

    const result = await uploadPhotos(albumId, formData);
    
    if (result.error) {
        toast({ title: "Erro no Upload", description: result.error, variant: "destructive" });
        setFiles(prev => prev.map(f => f.status === 'uploading' ? {...f, status: 'error', error: result.error} : f));
        setIsUploading(false);
        return;
    }

    // Sucesso
    setFiles(prev => prev.map(f => f.status === 'uploading' ? {...f, status: 'success'} : f));
    setTotalFilesUploaded(prev => prev + filesToUpload.length);
    toast({ title: "Upload Concluído!", description: `${filesToUpload.length} fotos foram enviadas.`, variant: 'default' });

    setIsUploading(false);
    setProgress(100);
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success' && f.status !== 'error'));
    setTotalFilesUploaded(0);
    setProgress(0);
  }

  const FileStatusIcon = ({ status }: { status: UploadStatus }) => {
    switch(status) {
        case 'uploading': return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
        case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'error': return <AlertCircle className="h-5 w-5 text-destructive" />;
        default: return <FileImage className="h-5 w-5 text-muted-foreground" />;
    }
  }
  
  const filesPending = files.filter(f => f.status === 'pending' || f.status === 'uploading').length;
  const filesDone = files.filter(f => f.status === 'success' || f.status === 'error').length;
  const successfullyUploadedCount = files.filter(f => f.status === 'success').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-textDark">Enviar Fotos</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div
            {...getRootProps()}
            className={cn(
                "flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg transition-colors",
                isDragActive ? "border-primary bg-primary/10" : "hover:bg-muted/50",
                isUploading ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            )}
        >
          <input {...getInputProps()} />
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (múltiplos arquivos permitidos)</p>
            </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-textDark">Fila de Upload ({files.length})</h3>
            {(isUploading || progress > 0) && <Progress value={isUploading ? (successfullyUploadedCount / files.length) * 100 : progress} className="w-full" />}
            <ScrollArea className="h-60 w-full pr-4">
              <div className="space-y-3">
                {files.map((upload, index) => (
                    <div key={index} className="flex items-center gap-4 p-2 border rounded-md">
                       <Image src={upload.preview} alt={upload.file.name} width={40} height={40} className="rounded-md object-cover h-10 w-10" />
                       <div className="flex-grow truncate">
                            <p className="text-sm font-medium truncate">{upload.file.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {upload.error ? (
                                    <span className="text-destructive">{upload.error}</span>
                                ) : (
                                    `${(upload.file.size / 1024).toFixed(2)} KB`
                                )}
                            </p>
                       </div>
                       <FileStatusIcon status={upload.status} />
                    </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex justify-end gap-2">
                {filesDone > 0 && !isUploading && (
                     <Button variant="secondary" onClick={clearCompleted}>Limpar Lista</Button>
                )}
                {successfullyUploadedCount > 0 && !isUploading && (
                    <Button onClick={() => document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' })}>
                        Ir para a Galeria
                        <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                )}
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  );
}
