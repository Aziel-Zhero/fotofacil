
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { CheckCircle, Camera, Users, ShieldCheck, FileKey2 } from 'lucide-react';
import { MasonryGallery } from '@/components/masonry-gallery';

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

const plans = [
    {
        name: "Fotógrafo Essencial",
        price: "25,00",
        period: "/mês",
        description: "Ideal para começar com o pé direito.",
        features: [
            "Até 20 álbuns ativos",
            "Upload de até 5.000 fotos",
            "Marcação com IA (1000 fotos/mês)",
            "Suporte por email"
        ],
        isHighlighted: false,
    },
    {
        name: "Fotógrafo Pro",
        price: "20,00",
        period: "/mês",
        billingInfo: "Cobrado R$120,00 a cada 6 meses",
        description: "O mais popular para profissionais em crescimento.",
        features: [
            "Álbuns ilimitados",
            "Upload de fotos ilimitado",
            "Marcação com IA ilimitada",
            "Monetização de fotos extras",
            "Suporte prioritário via chat"
        ],
        isHighlighted: true,
    },
    {
        name: "Estúdio Anual",
        price: "17,50",
        period: "/mês",
        billingInfo: "Cobrado R$210,00 anualmente",
        description: "A solução completa para estúdios e grandes volumes.",
        features: [
            "Todos os benefícios do Plano Pro",
            "Logo e cores personalizadas",
            "Relatórios de seleção de clientes",
            "Múltiplos usuários (em breve)"
        ],
        isHighlighted: false,
    }
]

const galleryItems = [
    { id: "1", img: "https://placehold.co/600x900.png", dataAiHint: "wedding photo", height: 400 },
    { id: "2", img: "https://placehold.co/600x750.png", dataAiHint: "portrait photography", height: 250 },
    { id: "3", img: "https://placehold.co/600x800.png", dataAiHint: "family picture", height: 600 },
    { id: "4", img: "https://placehold.co/800x600.png", dataAiHint: "landscape shot", height: 300 },
    { id: "5", img: "https://placehold.co/700x850.png", dataAiHint: "event photography", height: 500 },
    { id: "6", img: "https://placehold.co/600x950.png", dataAiHint: "fashion model", height: 450 },
];

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
                <Link href="/register">Comece Gratuitamente</Link>
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

        {/* Masonry Gallery Section */}
        <section className="py-20 md:py-32 bg-muted/20">
            <div className="container">
                 <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Galerias que Impressionam</h2>
                <MasonryGallery items={galleryItems} />
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
                <CardHeader className="flex flex-col items-start gap-4">
                   <div className="bg-primary/10 p-3 rounded-full">
                     <Camera className="h-6 w-6 text-primary" />
                   </div>
                  <CardTitle className="font-headline text-xl">Gerenciamento de Álbuns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className='text-muted-foreground'>Crie álbuns elegantes e personalizados com:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Datas de validade</li>
                      <li>Proteção por senha</li>
                      <li>Limites de seleção definidos por você</li>
                  </ul>
                  <p className='text-muted-foreground mt-2'>Organize tudo com facilidade e controle total.</p>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-col items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Acesso Seguro para o Cliente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className='text-muted-foreground'>Compartilhe seus álbuns por meio de:</p>
                     <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Um ID exclusivo</li>
                      <li>Um código secreto gerado automaticamente</li>
                  </ul>
                  <p className='text-muted-foreground mt-2'>Visualização protegida e privada, só para quem você autorizar.</p>
                </CardContent>
              </Card>
              <Card className="transform transition-transform hover:-translate-y-2">
                <CardHeader className="flex flex-col items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                     <FileKey2 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl">Pagamentos PIX Integrados</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <p className='text-muted-foreground'>Facilite a venda de fotos extras com pagamentos rápidos via PIX:</p>
                   <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      <li>Valor adicional por fotos extras</li>
                      <li>Chave PIX única por transação</li>
                  </ul>
                  <p className='text-muted-foreground mt-2'>Processo simples e direto para o cliente.</p>
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
                Economize horas de trabalho com nossa IA que organiza tudo para você. Você foca na fotografia — nós cuidamos da organização:
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
        
        {/* Seção de Preços */}
        <section id="pricing" className="bg-muted/50 py-20 md:py-32">
            <div className="container max-w-5xl">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-bold font-headline">Assinatura para Fotógrafos</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Escolha o plano que melhor se adapta ao seu volume de trabalho e comece a otimizar seu tempo hoje mesmo.
                    </p>
                </div>
                <div className="grid lg:grid-cols-3 gap-8 items-start">
                    {plans.map(plan => (
                        <Card key={plan.name} className={`flex flex-col h-full ${plan.isHighlighted ? 'border-primary border-2 shadow-xl' : ''}`}>
                            <CardHeader>
                                {plan.isHighlighted && (
                                    <div className="flex justify-center">
                                        <div className="bg-primary text-primary-foreground font-bold text-xs py-1 px-3 rounded-full -mt-10 mb-4">
                                            MAIS POPULAR
                                        </div>
                                    </div>
                                )}
                                <CardTitle className="font-headline text-2xl text-center">{plan.name}</CardTitle>
                                <CardDescription className="text-center">{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-6">
                                <div className="text-center">
                                    <span className="text-4xl font-bold">R$ {plan.price}</span>
                                    <span className="text-lg font-normal text-muted-foreground">{plan.period}</span>
                                    {plan.billingInfo && <p className="text-xs text-muted-foreground mt-1">{plan.billingInfo}</p>}
                                </div>
                                <ul className="space-y-3 text-sm">
                                {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start gap-2">
                                            <CheckCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.isHighlighted ? 'text-primary' : 'text-muted-foreground'}`}/>
                                            <span>{feature}</span>
                                        </li>
                                ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full" 
                                    variant={plan.isHighlighted ? 'default' : 'outline'}
                                    asChild
                                >
                                  <Link href="/register/photographer">Assinar Agora</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>


      </main>
      <LandingFooter />
    </div>
  );
}
