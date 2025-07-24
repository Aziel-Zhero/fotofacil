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
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  companyName: z.string().min(1, 'Company name is required'),
});

export function PhotographerRegisterForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      password: '',
      companyName: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Handle photographer registration logic
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <FormField name="fullName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Smith" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
           <FormField name="companyName" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="John Smith Photography" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="email" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="john.smith@example.com" {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField name="username" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Username</FormLabel><FormControl><Input placeholder="john_smith_photo" {...field} /></FormControl><FormMessage /></FormItem>
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
