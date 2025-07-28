
"use client";

import { DashboardHeader } from '@/components/dashboard-header';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground")}>
      <DashboardHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
