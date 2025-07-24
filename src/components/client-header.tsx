
"use client"
import Link from "next/link";
import { User, LogOut, Camera, Download, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ClientHeader() {
  const clientId = "ID:USR-12345"; // Mock data

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold">FotoFácil</span>
            </Link>
            
            <div className="flex items-center gap-4">
                 <p className="text-sm text-muted-foreground hidden sm:block">{clientId}</p>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="https://placehold.co/100x100.png" alt="Cliente" />
                                <AvatarFallback>C</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none font-headline">Cliente Silva</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {clientId}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         <DropdownMenuItem asChild>
                            <Link href="/gallery">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                <span>Meus Álbuns</span>
                            </Link>
                        </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                            <Link href="/gallery/downloads">
                                <Download className="mr-2 h-4 w-4" />
                                <span>Downloads</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/gallery/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Meu Perfil</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Sair</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </div>
    </header>
  );
}
