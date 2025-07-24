import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Camera, Users, ShieldCheck } from 'lucide-react';

const LandingHeader = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Camera className="h-6 w-6 text-primary" />
        <span className="font-headline text-xl font-bold text-foreground">PhotoFolio Flow</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const LandingFooter = () => (
  <footer className="border-t">
    <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row">
      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
        Built by your creative partner. &copy; {new Date().getFullYear()} PhotoFolio Flow. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
          <div className="flex flex-col gap-6">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
              Share Your Vision, <br />
              <span className="text-primary">Effortlessly.</span>
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              PhotoFolio Flow is the ultimate platform for photographers to organize, share, and manage client photo selections. Streamline your workflow and impress your clients.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] md:min-h-[400px]">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Photographer's portfolio"
                fill
                className="object-cover rounded-xl shadow-2xl"
                data-ai-hint="photography portfolio"
             />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">A Better Workflow is a Click Away</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to deliver beautiful photo galleries and simplify client proofing.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                   <div className="bg-primary/10 p-3 rounded-full">
                     <Camera className="h-6 w-6 text-primary" />
                   </div>
                  <CardTitle className="font-headline text-xl">Album Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Create stunning, customizable albums with expiration dates, password protection, and selection limits.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Seamless Client Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Share albums with a unique ID and secret code for a secure and private viewing experience.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                     <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Secure Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Handle extra photo selections with ease through integrated PIX payments, using unique keys for each transaction.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* AI Tagging Feature */}
        <section className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-full min-h-[300px] md:min-h-[400px]">
              <Image
                src="https://placehold.co/600x450.png"
                alt="AI in action"
                fill
                className="object-cover rounded-xl shadow-2xl"
                data-ai-hint="artificial intelligence photography"
              />
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-headline text-primary font-semibold">Powered by AI</span>
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Automated Image Tagging</h2>
              <p className="text-lg text-muted-foreground">
                Save hours of manual work. Our GenAI automatically analyzes and tags your photos upon upload, making your collection searchable and organized from the start.
              </p>
              <ul className="grid gap-3">
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Smart, relevant tags for every photo.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Improve searchability within your albums.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Focus on photography, not data entry.</span>
                  </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
