"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  FileImage,
  Loader2,
  Send,
  UploadCloud,
  X,
} from "lucide-react";
import Image from "next/image";
import { sendSupportEmail } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DESCRIPTION_LENGTH = 2500;

const supportSchema = z.object({
  name: z.string().min(1, "Seu nome é obrigatório."),
  email: z.string().email("Por favor, insira um e-mail válido."),
  contactReason: z.enum(["problem", "suggestion"], {
    required_error: "Você precisa selecionar um motivo para o contato.",
  }),
  description: z
    .string()
    .min(10, "Por favor, forneça uma descrição com pelo menos 10 caracteres.")
    .max(MAX_DESCRIPTION_LENGTH, `A descrição não pode exceder ${MAX_DESCRIPTION_LENGTH} caracteres.`),
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

  const descriptionValue = form.watch("description", "");

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        form.setValue("name", user.user_metadata?.fullName || "");
        form.setValue("email", user.email || "");
      }
    };
    fetchUser();
  }, [form]);

  const contactReason = form.watch("contactReason");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo Muito Grande",
          description: `O arquivo excede o limite de 2MB. Por favor, selecione uma imagem menor.`,
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
      form.setValue("screenshot", selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    form.setValue("screenshot", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function onSubmit(values: z.infer<typeof supportSchema>) {
    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value as string | Blob);
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
        description: "Obrigado pelo seu contato. Responderemos em breve.",
      });
      form.reset({
        name: user?.user_metadata?.fullName || "",
        email: user?.email || "",
        description: "",
        contactReason: undefined,
      });
      handleRemoveFile();
    }

    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 animate-in fade-in"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Seu nome" {...field} readOnly disabled />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="seu@email.com" {...field} readOnly disabled />
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
            <FormItem>
              <FormLabel>Motivo do Contato</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col gap-3 mt-2"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                        <RadioGroupItem value="problem" />
                    </FormControl>
                    <FormLabel className="font-normal">Relatar um Problema</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                        <RadioGroupItem value="suggestion" />
                    </FormControl>
                    <FormLabel className="font-normal">Sugerir uma Melhoria</FormLabel>
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
                  <FormLabel>{contactReason === "problem" ? "Descreva o problema" : "Descreva a melhoria"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        contactReason === "problem"
                          ? "Explique o que estava fazendo, o que deu errado e o que esperava."
                          : "Como podemos melhorar? Deixe sua sugestão aqui."
                      }
                      rows={5}
                      {...field}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                    />
                  </FormControl>
                   <div className="flex justify-end text-xs text-muted-foreground">
                    {descriptionValue.length} / {MAX_DESCRIPTION_LENGTH}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {contactReason === "problem" && (
              <FormItem>
                <FormLabel>Captura de Tela (opcional)</FormLabel>
                <FormControl>
                  <div
                    className="flex justify-center items-center w-full h-36 border-2 border-dashed border-muted rounded-lg cursor-pointer hover:bg-muted/20 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {!preview ? (
                      <div className="text-center text-muted-foreground">
                        <UploadCloud className="mx-auto h-8 w-8" />
                        <p className="text-sm mt-1">
                          <span className="font-medium text-primary">Clique ou arraste para enviar</span>
                        </p>
                        <p className="text-xs">PNG ou JPG (Máx 2MB)</p>
                      </div>
                    ) : (
                      <div className="relative h-full w-full p-2">
                        <Image src={preview} alt="Preview" fill className="object-contain rounded-md" />
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
                />
                {file && (
                  <div className="mt-2 flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="w-5 h-5 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </FormItem>
            )}
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={!contactReason || isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" /> Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Enviar Mensagem
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
