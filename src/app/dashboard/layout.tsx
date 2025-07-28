
"use client";

import { DashboardHeader } from '@/components/dashboard-header';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPlan = "Essencial Semestral"; // Mock data
  const isSubscribed = true; // Mock data

  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground")}>
      <DashboardHeader />
      {isSubscribed && (
        <div className="bg-primary/10 border-b border-primary/20">
            <div className="container flex items-center justify-center h-12">
                <p className="text-sm text-foreground/80">
                    <span className="font-bold flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-500"/>
                        Plano Atual: {currentPlan}
                    </span>
                </p>
            </div>
        </div>
      )}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
