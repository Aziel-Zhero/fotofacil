"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Camera, User, Settings, LogOut, Aperture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background flex flex-col">
      <div className="p-6 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
            <Aperture className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold">PhotoFolio</span>
        </Link>
      </div>

      <div className="p-4 flex flex-col items-center border-b">
        <Avatar className="h-20 w-20 mb-2">
            <AvatarImage src="https://placehold.co/100x100.png" alt="Photographer" />
            <AvatarFallback>PH</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold font-headline">John Smith</h3>
        <p className="text-sm text-muted-foreground">ID: AZ00000001</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            asChild
          >
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
      </div>
    </aside>
  );
}
