"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, FileImage, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { generateTagsForImage } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

export function PhotoUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setTags([]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        handleUpload(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  
  const handleUpload = async (photoDataUri: string) => {
    setIsUploading(true);
    setProgress(0);

    // Simula o progresso do upload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 10;
      });
    }, 200);

    setTimeout(async () => {
      clearInterval(interval);
      setProgress(100);
      setIsUploading(false);
      setIsTagging(true);

      try {
        const generatedTags = await generateTagsForImage({ photoDataUri });
        setTags(generatedTags);
        toast({
            title: "Marcação com IA Concluída!",
            description: "Sua foto foi marcada com sucesso.",
        });
      } catch (error) {
        toast({
            title: "Falha na Marcação",
            description: "Não foi possível gerar tags para a imagem.",
            variant: "destructive",
        });
      } finally {
        setIsTagging(false);
      }
    }, 2000); // Simula 2 segundos de upload
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setProgress(0);
    setTags([]);
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
          {!preview && (
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
          />
        </div>

        {file && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 truncate">
                    <FileImage className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate font-medium">{file.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {(isUploading || isTagging) && <Progress value={progress} className="w-full mt-2" />}

            {isTagging && (
                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Gerando tags com IA...</span>
                </div>
            )}
            
            {tags.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">Tags Geradas por IA:</h4>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
