
import { DashboardStats } from '@/components/dashboard-stats';

export default function AnalysisPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Análise de Desempenho</h1>
        <p className="text-muted-foreground">
          Veja as principais métricas sobre sua atividade na plataforma.
        </p>
      </div>
      <DashboardStats />
    </div>
  );
}
