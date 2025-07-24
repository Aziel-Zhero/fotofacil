"use client";

import { useState } from 'react';
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
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
    name: z.string().min(1, 'Name is required.'),
    age: z.coerce.number().min(18, 'You must be at least 18.').optional(),
    pixKey: z.string().min(1, 'A PIX key is required for payments.'),
});

function generateRandomKey() {
    return 'aleatorio-' + Math.random().toString(36).substring(2, 22);
}

export function ProfileForm({ onSave }: { onSave?: () => void }) {
    const { toast } = useToast();
    const [showPixKey, setShowPixKey] = useState(false);
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        // Mock data, in a real app this would come from user data
        defaultValues: {
            name: "John Smith",
            age: 32,
            pixKey: "",
        },
      });

    const handleGeneratePixKey = () => {
        form.setValue('pixKey', generateRandomKey());
    }

    function onSubmit(values: z.infer<typeof profileSchema>) {
        console.log(values);
        toast({
            title: "Profile Updated",
            description: "Your information has been saved successfully.",
        });
        onSave?.();
      }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Your full name" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="age" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="pixKey" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Chave PIX (Aleatória)</FormLabel>
                    <div className="flex gap-2">
                         <FormControl>
                            <Input type={showPixKey ? 'text' : 'password'} placeholder="Generate or enter a random key" {...field} />
                         </FormControl>
                         <Button type="button" variant="outline" size="icon" onClick={() => setShowPixKey(!showPixKey)}>
                            {showPixKey ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                            <span className="sr-only">{showPixKey ? 'Hide' : 'Show'} PIX Key</span>
                         </Button>
                         <Button type="button" variant="outline" size="icon" onClick={handleGeneratePixKey}>
                            <Sparkles className="h-4 w-4"/>
                            <span className="sr-only">Generate Random PIX Key</span>
                         </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )} />
            <Button type="submit" className="w-full">Save Changes</Button>
        </form>
    </Form>
  );
}
