import { SettingsForm } from "@/components/settings-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8 max-w-3xl">
        <div className="mb-8">
            <h1 className="text-3xl font-bold font-headline">Configurações</h1>
            <p className="text-muted-foreground">Gerencie a aparência do sistema e seus links sociais.</p>
        </div>
        <SettingsForm />
    </div>
  );
}
