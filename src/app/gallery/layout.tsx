
import { ClientHeader } from '@/components/client-header';
import { cn } from '@/lib/utils';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-background text-foreground")}>
      <ClientHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
