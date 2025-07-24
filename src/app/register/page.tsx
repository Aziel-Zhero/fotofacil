import AuthLayout from '@/components/layouts/auth-layout';
import RoleSelector from '@/components/auth/role-selector';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Junte-se ao FotoFácil"
      description="Primeiro, diga-nos quem você é. Isso nos ajudará a personalizar sua experiência."
    >
      <RoleSelector />
    </AuthLayout>
  );
}
