
"use client";

import { useState, useEffect } from 'react';
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
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useIMask } from 'react-imask';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  document: z.string().optional(),
  cardNumber: z.string().min(16, 'O número do cartão deve ter pelo menos 16 dígitos.'),
  cardHolder: z.string().min(1, 'O nome do titular é obrigatório.'),
  cardExpiry: z.string().length(5, 'A validade deve estar no formato MM/AA.'),
  cardCvc: z.string().length(3, 'O CVC deve ter 3 dígitos.'),
  installments: z.string().min(1, "Selecione o número de parcelas"),
});

type Brand = 'visa' | 'mastercard' | 'discover' | 'amex' | 'unknown';

export function CheckoutForm() {
  const { toast } = useToast();
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState('credit-card');
  const [user, setUser] = useState<User | null>(null);
  const [cardBrand, setCardBrand] = useState<Brand>('unknown');

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      document: '',
      cardNumber: '',
      cardHolder: '',
      cardExpiry: '',
      cardCvc: '',
      installments: '1',
    },
  });
  
  const { ref: cardNumberRef } = useIMask({
    mask: [
        { mask: '0000 0000 0000 0000', regex: /^4/, cardtype: 'visa' },
        { mask: '0000 0000 0000 0000', regex: /^5[1-5]/, cardtype: 'mastercard' },
        { mask: '0000 000000 00000', regex: /^3[47]/, cardtype: 'amex' },
        { mask: '0000 0000 0000 0000', regex: /^(6011|65|64[4-9])/, cardtype: 'discover' },
        { mask: '0000 0000 0000 0000', cardtype: 'unknown' },
    ],
    onAccept: (value, mask) => {
        const cardType = (mask as any).cardtype;
        setCardBrand(cardType || 'unknown');
        // Manually trigger react-hook-form update
        form.setValue('cardNumber', value as string, { shouldValidate: true });
    },
  });

  const { ref: expiryRef } = useIMask({
    mask: 'MM/YY',
    blocks: {
        MM: { mask: IMask.MaskedRange, from: 1, to: 12 },
        YY: { mask: IMask.MaskedRange, from: new Date().getFullYear() % 100, to: 99 },
    },
     onAccept: (value) => {
        form.setValue('cardExpiry', value as string, { shouldValidate: true });
    }
  });


  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            form.setValue('fullName', user.user_metadata?.fullName || '');
            form.setValue('document', user.user_metadata?.document || '');
            form.setValue('cardHolder', user.user_metadata?.fullName || '');
        }
    }
    fetchUser();
  }, [form]);

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

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
       <div className="md:sticky md:top-24 space-y-6">
            {activeTab === 'credit-card' ? (
                 <InteractiveCreditCard 
                    isFlipped={isCardFlipped}
                    brand={cardBrand}
                    cardNumber={cardValues.cardNumber}
                    cardHolder={cardValues.cardHolder}
                    cardExpiry={cardValues.cardExpiry}
                    cardCvc={cardValues.cardCvc}
                />
            ) : (
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
            )}
             <Form {...form}>
                <form className={activeTab !== 'credit-card' ? 'hidden' : ''}>
                    <div className="space-y-4">
                        <FormField name="fullName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input placeholder="Seu nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="document" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>CPF / CNPJ</FormLabel><FormControl><Input placeholder="Seu documento (opcional)" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </form>
             </Form>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Tabs defaultValue="credit-card" className="w-full" onValueChange={setActiveTab}>
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
                                  <FormControl><Input placeholder="0000 0000 0000 0000" {...field} ref={cardNumberRef} /></FormControl>
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
                                <FormField name="cardExpiry" control={form.control} render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Validade</FormLabel>
                                        <FormControl><Input placeholder="MM/AA" {...field} ref={expiryRef} /></FormControl>
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
                           <FormField
                            control={form.control}
                            name="installments"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parcelas</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o número de parcelas" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="1">1x sem juros</SelectItem>
                                    <SelectItem value="2">2x sem juros</SelectItem>
                                    <SelectItem value="3">3x sem juros</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                      </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="pix">
                 <div className="text-center text-muted-foreground p-8">
                     <p>Selecione PIX e clique no botão abaixo para gerar o código.</p>
                 </div>
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
