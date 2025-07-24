
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, LogOut, Aperture } from 'lucide-react';
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

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/dashboard/profile', label: 'Perfil', icon: User },
  // { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Aperture className="h-8 w-8 text-primary" />
                    <span className="font-headline text-xl font-bold">FotoFácil</span>
                </Link>
                <nav className="hidden md:flex items-center gap-4">
                    {navItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname === item.href ? 'secondary' : 'ghost'}
                        className="justify-start"
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
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                         <Avatar className="h-10 w-10">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="Fotógrafo" />
                            <AvatarFallback>JS</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none font-headline">John Smith</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                ID: AZ00000001
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                         <Link href="/dashboard/profile">
                            <User className="mr-2 h-4 w-4" />
                            <span>Perfil</span>
                         </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                         <Link href="/dashboard/settings">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Configurações</span>
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
    </header>
  );
}
