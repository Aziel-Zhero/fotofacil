import { ProfileForm } from "@/components/profile-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Complete seu Perfil</CardTitle>
          <CardDescription>
            Essas informações ajudam a otimizar seu fluxo de trabalho, especialmente para pagamentos de seleções de fotos extras.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
