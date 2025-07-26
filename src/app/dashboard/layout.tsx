
"use client";

import { DashboardHeader } from '@/components/dashboard-header';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPlan = "Essencial Semestral"; // Mock data
  const isSubscribed = true; // Mock data

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <DashboardHeader />
      {isSubscribed && (
        <div className="bg-primary/10 border-b border-primary/20">
            <div className="container flex items-center justify-between h-14">
                <p className="text-sm text-primary-foreground">
                    <span className="font-bold flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500"/>
                        Plano Atual: {currentPlan}
                    </span>
                </p>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/subscription">
                        Gerenciar Assinatura
                    </Link>
                </Button>
            </div>
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
