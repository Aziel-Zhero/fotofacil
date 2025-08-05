import Link from "next/link";
import { Camera } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export default function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
        <div className="absolute top-8 left-8">
            <Link href="/" className="flex items-center gap-2 text-foreground">
                <Camera className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-bold">FotoFácil</span>
            </Link>
        </div>
      <Card className="w-full max-w-md md:max-w-2xl shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl tracking-tight">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children}
      </Card>
    </div>
  );
}
