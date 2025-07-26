
"use client"
import { BarChart, Folder, ImageIcon, Star, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { MonthlyUsageChart } from "./monthly-usage-chart";
import { Button } from "./ui/button";
import Link from "next/link";
import { Progress } from "./ui/progress";


export function DashboardStats() {
    // Mock data - in a real app, this would come from your backend/state management
    const stats = {
        totalAlbums: 4,
        photosUsed: 455,
        photosLimit: 12600,
        currentPlan: "Essencial Semestral",
        renewsOn: "25 de Janeiro, 2025",
        status: "Ativo"
    };

    const usagePercentage = (stats.photosUsed / stats.photosLimit) * 100;

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Álbuns</CardTitle>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.totalAlbums}</div>
                    <p className="text-xs text-muted-foreground">álbuns criados na plataforma</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uso de Armazenamento</CardTitle>
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.photosUsed} / {stats.photosLimit}</div>
                    <p className="text-xs text-muted-foreground mb-2">fotos utilizadas no seu plano</p>
                    <Progress value={usagePercentage} className="h-2" />
                </CardContent>
            </Card>
            <Card className="lg:col-span-2">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uso Mensal (Últimos 6 meses)</CardTitle>
                    <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                   <MonthlyUsageChart />
                </CardContent>
            </Card>
            <Card className="lg:col-span-4">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline">
                        <Star className="h-5 w-5 text-primary"/>
                        Detalhes da Assinatura
                    </CardTitle>
                 </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4 items-center">
                   <div>
                     <p className="text-sm font-semibold">Plano Atual</p>
                     <p className="text-muted-foreground">{stats.currentPlan}</p>
                   </div>
                   <div>
                     <p className="text-sm font-semibold">Próxima Renovação</p>
                     <p className="text-muted-foreground">{stats.renewsOn}</p>
                   </div>
                   <div className="md:text-right">
                       <Button asChild>
                           <Link href="/dashboard/subscription">
                             <Wallet className="mr-2 h-4 w-4"/>
                             Gerenciar Assinatura
                           </Link>
                       </Button>
                   </div>
                </CardContent>
            </Card>
        </div>
    );
}
