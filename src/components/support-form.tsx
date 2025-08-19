
"use client";

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FileImage, Loader2, Send, UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { sendSupportEmail } from '@/app/actions';
import { Input } from './ui/input';
import { createClient } from '@/lib/supabase/client';
import { type User } from '@supabase/supabase-js';

const supportSchema = z.object({
  name: z.string().min(1, "Seu nome é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  contactReason: z.enum(["problem", "suggestion"], {
    required_error: "Você precisa selecionar um motivo para o contato.",
  }),
  description: z.string().min(10, "Por favor, forneça uma descrição com pelo menos 10 caracteres."),
  screenshot: z.any().optional(),
});

export function SupportForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof supportSchema>>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      name: "",
      email: "",
      description: "",
    },
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
            form.setValue('name', user.user_metadata?.fullName || '');
            form.setValue('email', user.email || '');
        }
    }
    fetchUser();
  }, [form]);

  const contactReason = form.watch('contactReason');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "Arquivo muito grande",
          description: "Por favor, selecione um arquivo com menos de 2MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      form.setValue('screenshot', selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    form.setValue('screenshot', null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: z.infer<typeof supportSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    const result = await sendSupportEmail(formData);

    if (result.error) {
       toast({
        title: "Erro ao Enviar",
        description: result.error,
        variant: "destructive",
      });
    } else {
       toast({
        title: "Mensagem Enviada!",
        description: "Obrigado pelo seu contato. Nossa equipe responderá em breve.",
      });
      form.reset({
        name: user?.user_metadata?.fullName || '',
        email: user?.email || '',
        description: '',
        contactReason: undefined
      });
      handleRemoveFile();
    }
    
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Seu Nome</FormLabel>
                        <FormControl>
                            <Input placeholder="João da Silva" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Seu Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="joao.silva@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
        <FormField
          control={form.control}
          name="contactReason"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Qual o motivo do seu contato?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="problem" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Relatar um Problema
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="suggestion" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Sugerir uma Melhoria
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {contactReason && (
          <>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{contactReason === 'problem' ? 'Descreva o problema' : 'Descreva sua sugestão'}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        contactReason === 'problem'
                          ? "Tente detalhar o máximo possível: o que você estava fazendo, o que aconteceu e o que você esperava que acontecesse."
                          : "Qual funcionalidade você gostaria de ver ou como podemos melhorar a plataforma?"
                      }
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {contactReason === 'problem' && (
              <FormItem>
                <FormLabel>Anexar uma imagem (Opcional)</FormLabel>
                <FormControl>
                  <div
                    className="flex justify-center items-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {!preview && (
                        <div className="text-center">
                            <UploadCloud className="mx-auto h-8 w-8 text-muted-foreground" />
                            <p className="mt-2 text-sm text-muted-foreground">
                                <span className="font-semibold text-primary">Clique para enviar</span>
                            </p>
                             <p className="text-xs text-muted-foreground">PNG ou JPG (Máx. 2MB)</p>
                        </div>
                    )}
                     {preview && (
                        <div className="relative h-full w-full p-2">
                             <Image src={preview} alt="Pré-visualização" fill className="object-contain rounded-md" />
                        </div>
                     )}
                  </div>
                </FormControl>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleFileChange}
                    name="screenshot"
                  />
                 {file && (
                    <div className="mt-2">
                        <div className="flex items-center justify-between text-sm p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2 truncate">
                                <FileImage className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                <span className="truncate font-medium">{file.name}</span>
                            </div>
                             <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
              </FormItem>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={!contactReason || isSubmitting}>
            {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
            ) : (
                <Send className="mr-2 h-4 w-4" />
            )}
            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
