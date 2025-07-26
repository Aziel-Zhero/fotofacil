
"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileImage, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Photo } from "@/app/dashboard/album/[albumId]/page";
import { ScrollArea } from "./ui/scroll-area";

interface PhotoUploaderProps {
    onUploadComplete: (photo: Photo) => void;
}

export function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
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
        handleUpload(newFiles, results);
      });
    }
  };
  
  const handleUpload = async (uploadFiles: File[], photoDataUris: string[]) => {
    setIsUploading(true);
    setProgress(0);

    const totalFiles = uploadFiles.length;
    let filesUploaded = 0;

    for (let i = 0; i < totalFiles; i++) {
        const file = uploadFiles[i];
        const photoDataUri = photoDataUris[i];
        
        // Simulate individual file upload
        await new Promise(resolve => setTimeout(resolve, 500)); 

        const newPhoto: Photo = {
            id: Date.now() + i,
            url: photoDataUri,
            dataAiHint: 'nova foto',
            name: file.name
        };
        onUploadComplete(newPhoto);

        filesUploaded++;
        setProgress((filesUploaded / totalFiles) * 100);
    }


    toast({
      title: "Upload Concluído!",
      description: `${totalFiles} foto(s) foram enviadas com sucesso.`,
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
      <CardContent className="p-6">
        <div
          className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
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
          {previews.length > 0 && (
            <ScrollArea className="h-full w-full">
                <div className="flex flex-wrap justify-center gap-2 p-4">
                    {previews.map((src, index) => (
                        <Image key={index} src={src} alt={`Pré-visualização ${index}`} width={100} height={100} className="object-contain max-h-full rounded-md border" />
                    ))}
                </div>
            </ScrollArea>
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

        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                    <FileImage className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{files.length} arquivo(s) selecionado(s)</span>
                </div>
                {!isUploading && progress === 0 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFiles}>
                      <X className="h-4 w-4" />
                  </Button>
                )}
            </div>

            {isUploading && (
              <>
                <Progress value={progress} className="w-full mt-2" />
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Enviando... {Math.round(progress)}%</span>
                </div>
              </>
            )}
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}
