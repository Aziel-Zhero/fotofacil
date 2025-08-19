
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
import { uploadPhoto } from "@/app/dashboard/album/[albumId]/actions";

interface UploadFile {
  file: File;
  preview: string;
}

interface PhotoUploaderProps {
  onUploadComplete: (photo: Photo) => void;
  albumId: string;
}

export function PhotoUploader({ onUploadComplete, albumId }: PhotoUploaderProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newUploadFiles: UploadFile[] = [];
      const filePromises = Array.from(selectedFiles).map((file) => {
        return new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            newUploadFiles.push({ file, preview: reader.result as string });
            resolve();
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(filePromises).then(() => {
        const allFiles = [...files, ...newUploadFiles];
        setFiles(allFiles);
        handleUpload(allFiles); 
      });
    }
  };

  const handleUpload = async (filesToUpload: UploadFile[]) => {
    if (isUploading) return;
    setIsUploading(true);
    setProgress(0);

    const totalFiles = filesToUpload.length;
    let filesUploaded = 0;

    for (let i = 0; i < totalFiles; i++) {
      const { file, preview } = filesToUpload[i];
      
      const formData = new FormData();
      formData.append('albumId', albumId);
      formData.append('photoName', file.name);
      formData.append('photoDataUri', preview);

      const result = await uploadPhoto(formData);

      if (result.error || !result.data) {
        toast({
            title: `Erro ao enviar ${file.name}`,
            description: result.error,
            variant: "destructive"
        });
      } else {
         onUploadComplete(result.data);
      }

      filesUploaded++;
      setProgress((filesUploaded / totalFiles) * 100);
    }

    toast({
      title: "Upload Concluído!",
      description: `${totalFiles} foto(s) foram processadas.`,
    });

    setTimeout(() => {
      setIsUploading(false);
      setFiles([]);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }, 1500);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };
  
  const handleClearAll = () => {
    setFiles([]);
    setProgress(0);
    setIsUploading(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className="flex justify-center items-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {files.length === 0 && !isUploading && (
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, WEBP (múltiplos arquivos permitidos)</p>
            </div>
          )}
          {files.length > 0 && !isUploading && (
             <ScrollArea className="h-full w-full p-4">
                <div className="flex flex-wrap justify-center gap-4">
                    {files.map(({ preview }, index) => (
                      <div key={index} className="relative group">
                          <Image src={preview} alt={`Pré-visualização ${index}`} width={100} height={100} className="object-cover h-24 w-24 rounded-md border" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFile(index);
                            }}
                           >
                            <X className="h-4 w-4" />
                           </Button>
                      </div>
                    ))}
                </div>
            </ScrollArea>
          )}
           {isUploading && (
              <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin"/>
                  <span>Enviando {files.length} fotos...</span>
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

        {files.length > 0 && (
          <div className="mt-4">
              {isUploading ? (
                <>
                  <Progress value={progress} className="w-full" />
                   <p className="text-center text-sm text-muted-foreground mt-2">Enviando... {Math.round(progress)}%</p>
                </>
              ) : (
                <div className="flex items-center justify-end">
                    <Button variant="ghost" onClick={handleClearAll}>Limpar tudo</Button>
                </div>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
