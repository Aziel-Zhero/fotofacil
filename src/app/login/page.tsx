
"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { LoginForm } from '@/components/auth/login-form';
import AuthLayout from '@/components/layouts/auth-layout';

function LoginPageContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message')
  const error = searchParams.get('error')

  return (
    <AuthLayout
      title="Acesse sua Conta"
      description="Insira suas credenciais para acessar sua conta de fotógrafo."
    >
      <LoginForm message={message ?? undefined} error={error ?? undefined}/>
    </AuthLayout>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
