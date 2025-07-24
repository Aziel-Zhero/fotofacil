"use client";

import Link from 'next/link';
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
import { CardContent, CardFooter } from '@/components/ui/card';

const formSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export function ClientRegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      whatsapp: '',
      email: '',
      username: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle client registration logic
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="whatsapp" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input placeholder="+1 (555) 123-4567" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="jane_doe" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="password" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button type="submit" className="w-full">Create Account</Button>
          <div className="text-sm text-muted-foreground">
            Already have an account? <Link href="/login" className="underline">Login</Link>
          </div>
        </CardFooter>
      </form>
    </Form>
  );
}
