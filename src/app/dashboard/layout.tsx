import { DashboardHeader } from '@/components/dashboard-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <DashboardHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
