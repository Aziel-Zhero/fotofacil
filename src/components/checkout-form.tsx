
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { Copy, CreditCard, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
});

export function CheckoutForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      document: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvc: '',
    },
  });

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log(values);
    toast({
        title: "Pagamento Confirmado!",
        description: "Sua assinatura foi ativada com sucesso.",
    })
  }

  const copyPixCode = () => {
    const pixCode = "00020126330014br.gov.bcb.pix0111123456789015204000053039865802BR5913NOME_DO_RECEB6008BRASILIA62070503***6304E2A5";
    navigator.clipboard.writeText(pixCode);
    toast({
        title: "Código PIX Copiado!",
        description: "Use o código no seu aplicativo de banco para pagar.",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField name="fullName" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField name="document" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>CPF / CNPJ</FormLabel><FormControl><Input placeholder="Seu documento" {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <Tabs defaultValue="credit-card" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credit-card">Cartão</TabsTrigger>
                <TabsTrigger value="pix">PIX</TabsTrigger>
            </TabsList>
            <TabsContent value="credit-card">
                <Card>
                    <CardContent className="space-y-4 pt-6">
                        <FormField name="cardNumber" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Número do Cartão</FormLabel><FormControl><Input placeholder="0000 0000 0000 0000" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField name="cardExpiry" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Validade</FormLabel><FormControl><Input placeholder="MM/AA" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="cardCvc" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>CVC</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="pix">
                 <Card>
                    <CardContent className="flex flex-col items-center justify-center pt-6 space-y-4">
                        <p className="text-sm text-center text-muted-foreground">Escaneie o QR Code ou copie o código abaixo para pagar via PIX.</p>
                        <Image src="https://placehold.co/200x200.png" data-ai-hint="qr code" alt="QR Code PIX" width={200} height={200} className="rounded-md"/>
                        <Button type="button" variant="outline" onClick={copyPixCode}>
                            <Copy className="mr-2"/>
                            Copiar Código PIX
                        </Button>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        <Button type="submit" className="w-full" size="lg">
            <Lock className="mr-2"/>
            Pagar e Ativar Plano
        </Button>
      </form>
    </Form>
  );
}
