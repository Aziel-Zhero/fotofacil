import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster"
import { Belleza, Alegreya } from 'next/font/google';
import { cn } from '@/lib/utils';
import './globals.css';

const fontHeadline = Belleza({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-headline',
});

const fontBody = Alegreya({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'FotoFácil',
  description: 'Organize e compartilhe seus álbuns de fotos com clientes de forma transparente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={cn(
          "min-h-screen bg-background font-body antialiased",
          fontHeadline.variable,
          fontBody.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
