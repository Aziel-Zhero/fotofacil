
"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileImage, X, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "./ui/scroll-area";
import { uploadPhotos } from "@/app/dashboard/actions";

interface PhotoUploaderProps {
    albumId: string;
}

export function PhotoUploader({ albumId }: PhotoUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles(newFiles);

      const newPreviews: string[] = [];
      const filePromises = newFiles.map(file => {
          return new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  resolve(reader.result as string);
              };
              reader.readAsDataURL(file);
          });
      });

      Promise.all(filePromises).then((results) => {
        setPreviews(results);
      });
    }
  };
  
  const handleUpload = async () => {
    if (files.length === 0) {
        toast({ title: "Nenhuma foto selecionada", variant: "destructive" });
        return;
    }
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    files.forEach(file => {
        formData.append('photos', file);
    });

    // Animação da barra de progresso
    const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 10 : prev));
    }, 500);

    const result = await uploadPhotos(albumId, formData);
    
    clearInterval(interval);
    setProgress(100);

    if (result.error) {
        toast({
            title: "Erro no Upload",
            description: result.error,
            variant: "destructive"
        });
        setIsUploading(false);
        return;
    }

    toast({
      title: "Upload Concluído!",
      description: `${files.length} foto(s) foram enviadas com sucesso.`,
      action: <CheckCircle className="text-green-500"/>
    });

    // Reset after a short delay to show completion
    setTimeout(() => {
      setIsUploading(false);
      setFiles([]);
      setPreviews([]);
      setProgress(0);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    }, 1500);

  };

  const handleRemoveFiles = () => {
    setFiles([]);
    setPreviews([]);
    setProgress(0);
    setIsUploading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div
          className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {previews.length === 0 && !isUploading && (
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (múltiplos arquivos permitidos)</p>
            </div>
          )}
          {previews.length > 0 && !isUploading && (
            <ScrollArea className="h-full w-full">
                <div className="flex flex-wrap justify-center gap-2 p-4">
                    {previews.map((src, index) => (
                        <Image key={index} src={src} alt={`Pré-visualização ${index}`} width={100} height={100} className="object-contain max-h-full rounded-md border" />
                    ))}
                </div>
            </ScrollArea>
          )}
           {isUploading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground w-full px-4 flex-col">
                  <Loader2 className="h-8 w-8 animate-spin"/>
                  <span>Enviando... {Math.round(progress)}%</span>
                  <Progress value={progress} className="w-full mt-2" />
              </div>
            )}
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
            multiple
          />
        </div>

        {files.length > 0 && !isUploading && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate text-sm">
                <FileImage className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{files.length} arquivo(s) selecionado(s)</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFiles}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Enviar Fotos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
