
import { DashboardStats } from '@/components/dashboard-stats';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function AnalysisPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { count: albumCount, error: albumError } = await supabase
    .from('albums')
    .select('*', { count: 'exact', head: true })
    .eq('photographer_id', user.id);

  // Consulta para contar fotos de um fotógrafo específico
  const { data: photosData, error: photoError } = await supabase.rpc('get_photos_count_for_photographer', { p_photographer_id: user.id });

  const photoCount = photosData ?? 0;

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
        totalAlbums={albumCount ?? 0}
        totalPhotos={photoCount}
        planName={planDetails.name}
        photoLimit={planDetails.limit}
      />
    </div>
  );
}
