
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { InteractiveCreditCard } from './interactive-credit-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  document: z.string().min(1, 'CPF/CNPJ é obrigatório'),
  cardNumber: z.string().length(16, 'O número do cartão deve ter 16 dígitos.'),
  cardHolder: z.string().min(1, 'O nome do titular é obrigatório.'),
  cardExpiryMonth: z.string().min(1, 'Mês obrigatório'),
  cardExpiryYear: z.string().min(1, 'Ano obrigatório'),
  cardCvc: z.string().length(3, 'O CVC deve ter 3 dígitos.'),
});

export function CheckoutForm() {
  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      document: '',
      cardNumber: '',
      cardHolder: '',
      cardExpiryMonth: '',
      cardExpiryYear: '',
      cardCvc: '',
    },
  });

  const cardValues = form.watch();

  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    console.log(values);
    toast({
        title: "Pagamento Confirmado!",
        description: "Sua assinatura foi ativada com sucesso.",
    });
  }
  
  const copyPixCode = () => {
    const pixCode = "00020126330014br.gov.bcb.pix0111123456789015204000053039865802BR5913NOME_DO_RECEB6008BRASILIA62070503***6304E2A5";
    navigator.clipboard.writeText(pixCode);
    toast({
        title: "Código PIX Copiado!",
        description: "Use o código no seu aplicativo de banco para pagar.",
    })
  }

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

  return (
    <div className="relative">
      <InteractiveCreditCard 
        isFlipped={isCardFlipped}
        cardNumber={cardValues.cardNumber}
        cardHolder={cardValues.cardHolder}
        cardExpiryMonth={cardValues.cardExpiryMonth}
        cardExpiryYear={cardValues.cardExpiryYear.slice(-2)}
        cardCvc={cardValues.cardCvc}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8">
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
                  <Card className="bg-transparent border-none shadow-none">
                      <CardContent className="space-y-4 pt-6 p-1">
                          <FormField name="cardNumber" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Número do Cartão</FormLabel>
                                  <FormControl><Input placeholder="0000 0000 0000 0000" maxLength={16} {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                           <FormField name="cardHolder" control={form.control} render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome do Titular</FormLabel>
                                  <FormControl><Input placeholder="Nome como no cartão" {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          <div className="grid grid-cols-3 gap-4">
                              <FormField name="cardExpiryMonth" control={form.control} render={({ field }) => (
                                  <FormItem className="col-span-1">
                                      <FormLabel>Mês</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl><SelectTrigger><SelectValue placeholder="Mês" /></SelectTrigger></FormControl>
                                          <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                              <FormField name="cardExpiryYear" control={form.control} render={({ field }) => (
                                   <FormItem className="col-span-1">
                                      <FormLabel>Ano</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                          <FormControl><SelectTrigger><SelectValue placeholder="Ano" /></SelectTrigger></FormControl>
                                          <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                                      </Select>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                              <FormField name="cardCvc" control={form.control} render={({ field }) => (
                                  <FormItem className="col-span-1">
                                      <FormLabel>CVC</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="123" 
                                          maxLength={3} 
                                          {...field} 
                                          onFocus={() => setIsCardFlipped(true)}
                                          onBlur={() => setIsCardFlipped(false)}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
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
    </div>
  );
}
