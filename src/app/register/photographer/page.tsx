import AuthLayout from '@/components/layouts/auth-layout';
import { PhotographerRegisterForm } from '@/components/auth/photographer-register-form';

export default function PhotographerRegisterPage() {
  return (
    <AuthLayout
      title="Create Your Photographer Account"
      description="Start organizing and sharing your work today."
    >
      <PhotographerRegisterForm />
    </AuthLayout>
  );
}
