
"use client";

import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Photo } from '@/app/dashboard/album/[albumId]/page';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

interface PhotoViewerModalProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  selectedPhotos: Set<number>;
  onToggleSelection: (id: number) => void;
}

export function PhotoViewerModal({ 
  photos, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev,
  selectedPhotos,
  onToggleSelection
}: PhotoViewerModalProps) {
  const photo = photos[currentIndex];
  const isSelected = selectedPhotos.has(photo.id);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNext, onPrev, onClose]);


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

       <Button 
        variant="ghost" 
        size="icon" 
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-[101]"
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
      >
        <ChevronLeft className="h-8 w-8" />
        <span className="sr-only">Anterior</span>
      </Button>

       <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 z-[101]"
        onClick={(e) => { e.stopPropagation(); onNext(); }}
      >
        <ChevronRight className="h-8 w-8" />
        <span className="sr-only">Próxima</span>
      </Button>
      
      <div 
        className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="relative w-full h-full flex-1">
            <Image
                src={photo.url}
                alt={photo.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-white/40 text-5xl font-bold font-headline select-none transform -rotate-12">FotoFácil</span>
            </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-4">
             <Button
                variant={isSelected ? 'secondary' : 'default'}
                onClick={() => onToggleSelection(photo.id)}
                className="bg-white/20 text-white hover:bg-white/30"
             >
                <CheckCircle2 className={cn("mr-2", isSelected && "text-primary")} />
                {isSelected ? 'Desmarcar' : 'Selecionar'}
             </Button>
        </div>
      </div>
    </div>
  );
}
