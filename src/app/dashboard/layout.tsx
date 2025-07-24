import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-muted/30">
        {children}
      </main>
    </div>
  );
}
