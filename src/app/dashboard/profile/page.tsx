import { ProfileForm } from "@/components/profile-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Perfil e Segurança</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais, de segurança e da sua empresa.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
