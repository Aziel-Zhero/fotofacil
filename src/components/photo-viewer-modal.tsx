
"use client";

import Image from 'next/image';
import { X } from 'lucide-react';
import { Photo } from '@/app/dashboard/album/[albumId]/page';
import { Button } from './ui/button';

interface PhotoViewerModalProps {
  photo: Photo;
  onClose: () => void;
}

export function PhotoViewerModal({ photo, onClose }: PhotoViewerModalProps) {
  return (
    <div 
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-in fade-in-0"
        onClick={onClose}
    >
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 text-white hover:bg-white/20 h-10 w-10 z-[101]"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Fechar</span>
      </Button>
      
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full"
        onClick={(e) => e.stopPropagation()} // Impede que o clique na imagem feche o modal
      >
        <Image
          src={photo.url}
          alt={photo.name}
          width={1600}
          height={1200}
          className="object-contain w-full h-full"
          style={{ maxHeight: '90vh' }}
        />
      </div>
    </div>
  );
}
