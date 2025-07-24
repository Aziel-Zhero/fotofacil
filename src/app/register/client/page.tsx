import AuthLayout from '@/components/layouts/auth-layout';
import { ClientRegisterForm } from '@/components/auth/client-register-form';

export default function ClientRegisterPage() {
  return (
    <AuthLayout
      title="Create Your Client Account"
      description="Sign up to view and select your photos."
    >
      <ClientRegisterForm />
    </AuthLayout>
  );
}
