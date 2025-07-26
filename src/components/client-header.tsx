
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut, Camera, FolderOpen, Image as ImageIcon } from 'lucide-react';
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
  const pathname = usePathname();
  const clientId = "ID:USR-12345"; // Mock data

  const navItems = [
    { href: '/gallery', label: 'Seleção de Fotos', icon: ImageIcon },
    { href: '/gallery/delivered', label: 'Entregues', icon: FolderOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl font-bold text-foreground">FotoFácil</span>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        asChild
                    >
                        <Link href={item.href}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                        </Link>
                    </Button>
                    ))}
                </nav>
            </div>
            
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
                        <div className="md:hidden">
                             {navItems.map(item => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                </DropdownMenuItem>
                             ))}
                             <DropdownMenuSeparator />
                        </div>
                        <DropdownMenuItem asChild>
                            <Link href="/gallery/profile">
                                <User className="mr-2 h-4 w-4" />
                                <span>Meu Perfil</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

        </div>
    </header>
  );
}
