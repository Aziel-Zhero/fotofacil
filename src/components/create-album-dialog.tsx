"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "Album name is required."),
  expirationDate: z.string().min(1, "Expiration date is required."),
  password: z.string().optional(),
  maxPhotos: z.coerce.number().min(1, "Please set a maximum number of photos."),
  extraPhotoCost: z.coerce.number().optional(),
  pixKey: z.string().optional(),
});

function generateRandomKey() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function CreateAlbumDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            expirationDate: "",
            password: "",
            maxPhotos: 50,
            extraPhotoCost: 10,
            pixKey: "",
        },
      });

    const handleGeneratePixKey = () => {
        form.setValue('pixKey', generateRandomKey());
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
        setOpen(false);
        form.reset();
      }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New Album</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new album for your client.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Album Name</FormLabel><FormControl><Input placeholder="e.g., Wedding in Tuscany" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="expirationDate" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Expiration Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="password" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Access Password (Optional)</FormLabel><FormControl><Input type="password" placeholder="Leave blank for no password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="maxPhotos" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Max Photo Selections</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="extraPhotoCost" control={form.control} render={({ field }) => (
                    <FormItem><FormLabel>Cost per 10 Extra Photos (R$)</FormLabel><FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="pixKey" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>PIX Key for Extras</FormLabel>
                        <div className="flex gap-2">
                             <FormControl>
                                <Input placeholder="Your PIX key" {...field} />
                             </FormControl>
                             <Button type="button" variant="outline" size="icon" onClick={handleGeneratePixKey}>
                                <Sparkles className="h-4 w-4"/>
                                <span className="sr-only">Generate PIX Key</span>
                             </Button>
                        </div>
                        <FormMessage />
                    </FormItem>
                )} />
                <DialogFooter>
                    <Button type="submit">Create Album</Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
