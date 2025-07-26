import { ClientHeader } from '@/components/client-header';
import DarkVeil from '@/components/dark-veil';

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col text-foreground">
       <DarkVeil
        hueShift={210}
        noiseIntensity={0.02}
        warpAmount={0.5}
        speed={0.2}
       />
      <ClientHeader />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
