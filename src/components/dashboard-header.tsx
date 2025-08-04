
"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, Settings, LogOut, Aperture, Crown, HelpCircle, Star, FolderArchive, BarChart, Bell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";

const navItems = [
  { href: '/dashboard', label: 'Painel', icon: Home },
  { href: '/dashboard/analysis', label: 'Análise', icon: BarChart },
  { href: '/dashboard/delivered', label: 'Entregues', icon: FolderArchive },
  { href: '/dashboard/subscription', label: 'Assinatura', icon: Star },
];

const profileNavItems = [
    { href: '/dashboard/profile', label: 'Perfil', icon: User },
    { href: '/dashboard/register-client', label: 'Cadastrar Cliente', icon: UserPlus },
    { href: '/dashboard/settings', label: 'Configurações', icon: Settings },
    { href: '/dashboard/help', label: 'Ajuda', icon: HelpCircle },
]

export function DashboardHeader() {
  const pathname = usePathname();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isSubscriber, setIsSubscriber] = useState(true); // Mock data for subscription status
  const currentPlan = "Essencial Semestral"; // Mock data

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <Aperture className="h-8 w-8 text-accent" />
                    <span className="font-headline text-xl font-bold text-textDark">FotoFácil</span>
                </Link>
                <nav className="hidden md:flex items-center gap-1">
                    {navItems.map((item) => (
                    <Button
                        key={item.href}
                        variant={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard') ? 'secondary' : 'ghost'}
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
            
            <div className="flex items-center gap-4">
                 {isSubscriber && (
                    <div className="hidden sm:flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-semibold">{currentPlan}</span>
                    </div>
                 )}
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notificações</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                            <Avatar className="h-10 w-10 border-2 border-border">
                                <AvatarImage src={user?.user_metadata.avatar_url} alt={user?.user_metadata.fullName} />
                                <AvatarFallback>
                                    {getInitials(user?.user_metadata.fullName || '')}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none font-headline text-textDark">{user?.user_metadata.fullName || "Usuário"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.user_metadata.companyName || "Fotógrafo"}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                             {profileNavItems.map(item => (
                                <DropdownMenuItem key={item.href} asChild>
                                    <Link href={item.href}>
                                        <item.icon className="mr-2 h-4 w-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
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
                            <Link href="/login" onClick={async () => {
                                const supabase = createClient();
                                await supabase.auth.signOut();
                            }}>
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
