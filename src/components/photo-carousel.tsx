
"use client"

import * as React from "react"
import Image from "next/image"

import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Photo } from "@/app/dashboard/album/[albumId]/page"
import { Badge } from "./ui/badge"

interface PhotoCarouselProps {
    photos: Photo[]
}

export function PhotoCarousel({ photos }: PhotoCarouselProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-center">
        {photos.length === 0 ? (
           <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground">Nenhuma foto para exibir.</p>
            </div>
        ) : (
            <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
                <CarouselContent>
                    {photos.map((photo, index) => (
                    <CarouselItem key={photo.id}>
                        <div className="p-1">
                            <Card className="overflow-hidden">
                                <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                    <Image
                                        src={photo.url}
                                        alt={photo.name || `Foto ${photo.id}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-contain"
                                    />
                                    <Badge className="absolute top-2 left-2">
                                        {String(index + 1).padStart(3, '0')}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        )}
      </CardContent>
    </Card>
  )
}
