"use client";

import Link from 'next/link';
import { Camera, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '../ui/button';

export default function RoleSelector() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/register/photographer" className="block">
          <Card className="text-center p-8 h-full hover:bg-primary/5 hover:border-primary transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <Camera className="h-12 w-12 text-primary" />
              <h3 className="font-headline text-xl font-semibold">I'm a Photographer</h3>
              <p className="text-muted-foreground text-sm">Create albums, share with clients, and manage your work.</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/register/client" className="block">
          <Card className="text-center p-8 h-full hover:bg-primary/5 hover:border-primary transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4">
              <User className="h-12 w-12 text-primary" />
              <h3 className="font-headline text-xl font-semibold">I'm a Client</h3>
              <p className="text-muted-foreground text-sm">View shared albums and select your favorite photos.</p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <Button variant="link" asChild className="p-0 h-auto">
            <Link href="/login">
             Login
            </Link>
        </Button>
      </div>
    </div>
  );
}
