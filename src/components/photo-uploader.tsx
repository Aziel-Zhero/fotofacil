
"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileImage, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Photo } from "@/app/dashboard/album/[albumId]/page";

interface PhotoUploaderProps {
    onUploadComplete: (photo: Photo) => void;
}

export function PhotoUploader({ onUploadComplete }: PhotoUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        const photoDataUri = reader.result as string;
        setPreview(photoDataUri);
        handleUpload(selectedFile, photoDataUri);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleUpload = async (file: File, photoDataUri: string) => {
    setIsUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 95 ? 95 : prev + 10));
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      const newPhoto: Photo = {
          id: Date.now(),
          url: photoDataUri,
          dataAiHint: 'nova foto',
          name: file.name
      };
      onUploadComplete(newPhoto);

      toast({
        title: "Upload Concluído!",
        description: `${file.name} foi enviado com sucesso.`,
      });

      // Reset after a short delay to show completion
      setTimeout(() => {
        setIsUploading(false);
        setFile(null);
        setPreview(null);
        setProgress(0);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }, 1000);

    }, 2000); // Simulates 2 seconds of upload
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
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
          {!preview && !isUploading && (
            <div className="text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-semibold text-primary">Clique para enviar</span> ou arraste e solte
              </p>
              <p className="text-xs text-muted-foreground">PNG, JPG, ou WEBP</p>
            </div>
          )}
          {preview && (
             <Image src={preview} alt="Pré-visualização da imagem" width={150} height={150} className="object-contain max-h-full rounded-md" />
          )}
          <Input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {file && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                    <FileImage className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{file.name}</span>
                </div>
                {!isUploading && progress === 0 && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                      <X className="h-4 w-4" />
                  </Button>
                )}
            </div>

            {isUploading && (
              <>
                <Progress value={progress} className="w-full mt-2" />
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Enviando...</span>
                </div>
              </>
            )}
            
          </div>
        )}
      </CardContent>
    </Card>
  );
}
