
import { DashboardStats } from '@/components/dashboard-stats';

export default async function AnalysisPage() {

  const planDetails = {
    name: "Essencial Semestral", // Mock data, pode ser buscado do user_metadata ou de uma tabela de assinaturas
    limit: 12600, // Mock data
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline text-textDark">Análise de Desempenho</h1>
        <p className="text-muted-foreground">
          Veja as principais métricas sobre sua atividade na plataforma.
        </p>
      </div>
      <DashboardStats 
        planName={planDetails.name}
        photoLimit={planDetails.limit}
      />
    </div>
  );
}
