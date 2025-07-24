import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, Camera, Users, ShieldCheck, FileKey2 } from 'lucide-react';

const LandingHeader = () => (
  <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
      <Link href="/" className="flex items-center gap-2">
        <Camera className="h-6 w-6 text-primary" />
        <span className="font-headline text-xl font-bold text-foreground">FotoFácil</span>
      </Link>
      <nav className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard">Acessar como Fotógrafo</Link>
        </Button>
        <Button asChild>
          <Link href="/gallery">Acessar como Cliente</Link>
        </Button>
      </nav>
    </div>
  </header>
);

const LandingFooter = () => (
  <footer className="border-t">
    <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row">
      <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
        Construído por seu parceiro criativo. &copy; {new Date().getFullYear()} FotoFácil. Todos os Direitos Reservados.
      </p>
    </div>
  </footer>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingHeader />
      <main className="flex-1">
        {/* Seção Hero */}
        <section className="container grid lg:grid-cols-2 gap-12 items-center py-20 md:py-32">
          <div className="flex flex-col gap-6">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter">
              Compartilhe Sua Visão, <br />
              <span className="text-primary">Sem Complicação.</span>
            </h1>
            <p className="max-w-[600px] text-lg text-muted-foreground">
              FotoFácil é a plataforma inteligente para fotógrafos organizarem, compartilharem e gerenciarem seleções de fotos de forma profissional e segura. Otimize seu fluxo de trabalho e encante seus clientes com experiências visuais impecáveis.
            </p>
            <div className="flex gap-4">
              <Button size="lg" asChild>
                <Link href="/dashboard">Comece Gratuitamente</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Saiba Mais</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-full min-h-[300px] md:min-h-[400px]">
             <Image
                src="https://placehold.co/600x400.png"
                alt="Portfólio de fotógrafo"
                fill
                className="object-cover rounded-xl shadow-2xl"
                data-ai-hint="photography portfolio"
             />
          </div>
        </section>

        {/* Seção de Funcionalidades */}
        <section id="features" className="bg-muted/50 py-20 md:py-32">
          <div className="container">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="font-headline text-3xl md:text-4xl font-bold">⚡ Um Fluxo de Trabalho Profissional a um Clique de Distância</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Tudo o que você precisa para entregar galerias incríveis e tornar o processo de aprovação de fotos simples, rápido e eficiente.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                   <div className="bg-primary/10 p-3 rounded-full">
                     <Camera className="h-6 w-6 text-primary" />
                   </div>
                  <CardTitle className="font-headline text-xl">Gerenciamento de Álbuns</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Crie álbuns elegantes e personalizados com datas de validade, proteção por senha e limites de seleção definidos por você. Organize tudo com facilidade e controle total.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Acesso Seguro para o Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Compartilhe seus álbuns por meio de um ID exclusivo e um código secreto gerado automaticamente para uma visualização protegida e privada, só para quem você autorizar.</CardDescription>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                     <FileKey2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Pagamentos PIX Integrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Facilite a venda de fotos extras com pagamentos rápidos via PIX, usando chaves únicas por transação e um processo simples e direto para o cliente.</CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Funcionalidade de Marcação por IA */}
        <section className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-full min-h-[300px] md:min-h-[400px]">
              <Image
                src="https://placehold.co/600x450.png"
                alt="IA em ação"
                fill
                className="object-cover rounded-xl shadow-2xl"
                data-ai-hint="artificial intelligence photography"
              />
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-headline text-primary font-semibold">🤖 POTENCIALIZADO POR INTELIGÊNCIA ARTIFICIAL</span>
              <h2 className="font-headline text-3xl md:text-4xl font-bold">Marcação Automática de Imagens</h2>
              <p className="text-lg text-muted-foreground">
                Economize horas de trabalho com nossa IA que organiza tudo para você. Você foca na fotografia — nós cuidamos da organização.
              </p>
              <ul className="grid gap-3">
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Geração automática de tags inteligentes no upload.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Álbum pesquisável e filtrável com facilidade.</span>
                  </li>
                  <li className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-accent"/>
                      <span>Concentre-se na fotografia, não na entrada de dados.</span>
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
