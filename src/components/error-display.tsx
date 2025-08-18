
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardDrive, ServerCrash, TriangleAlert } from "lucide-react";

interface ErrorDisplayProps {
  statusCode: string;
  title: string;
  description: string;
  linkHref?: string;
  linkText?: string;
  onReset?: () => void;
}

export function ErrorDisplay({
  statusCode,
  title,
  description,
  linkHref,
  linkText,
  onReset,
}: ErrorDisplayProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center text-foreground p-4">
      <div className="max-w-md">
        <div className="mb-4 flex items-center justify-center gap-4 text-primary">
            <TriangleAlert className="h-12 w-12" />
            <h1 className="text-8xl font-bold font-headline tracking-tighter">
                {statusCode}
            </h1>
        </div>
        <h2 className="mt-8 text-3xl font-bold font-headline tracking-tight">
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground">
          {description}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {linkHref && linkText && (
            <Button asChild>
              <Link href={linkHref}>{linkText}</Link>
            </Button>
          )}
          {onReset && (
            <Button onClick={() => onReset()}>
              Tentar Novamente
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
