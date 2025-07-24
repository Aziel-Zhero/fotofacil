"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProfileForm } from './profile-form';

export function ProfileCompletionDialog() {
  // In a real app, this would be controlled by user state (e.g., from a context or store)
  const [isOpen, setIsOpen] = useState(false);

  // This is a mock trigger to show the dialog for demonstration purposes
  // In a real app, you would remove this and control `isOpen` from a higher-level component
  // e.g., useEffect on the dashboard page checking if profile is complete.
  useState(() => {
    // Simulating the dialog appearing for a new user
    setTimeout(() => setIsOpen(true), 1500);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Complete Your Profile</DialogTitle>
          <DialogDescription>
            Welcome! Before you get started, please add a few more details to your profile. This will help with features like payments for extra photos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <ProfileForm onSave={() => setIsOpen(false)}/>
        </div>
      </DialogContent>
    </Dialog>
  );
}
