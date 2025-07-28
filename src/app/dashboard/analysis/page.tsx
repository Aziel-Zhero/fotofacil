
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

  const { count: photoCount, error: photoError } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .in('album_id', (await supabase.from('albums').select('id').eq('photographer_id', user.id)).data?.map(a => a.id) || []);

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
        totalPhotos={photoCount ?? 0}
        planName={planDetails.name}
        photoLimit={planDetails.limit}
      />
    </div>
  );
}
