import { ClientProfileForm } from "@/components/client-profile-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ClientProfilePage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Meu Perfil</CardTitle>
          <CardDescription>
            Gerencie suas informações de contato e de segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
