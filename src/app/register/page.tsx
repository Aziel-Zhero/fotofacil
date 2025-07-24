import AuthLayout from '@/components/layouts/auth-layout';
import RoleSelector from '@/components/auth/role-selector';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Join PhotoFolio Flow"
      description="First, tell us who you are. This will help us tailor your experience."
    >
      <RoleSelector />
    </AuthLayout>
  );
}
