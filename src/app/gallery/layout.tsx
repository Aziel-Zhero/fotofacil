import { ClientHeader } from '@/components/client-header';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col text-foreground" style={{ backgroundColor: '#03045e' }}>
      <ClientHeader />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
