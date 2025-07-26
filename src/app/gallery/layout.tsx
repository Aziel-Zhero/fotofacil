import { ClientHeader } from '@/components/client-header';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <ClientHeader />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
