
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Send, Clock } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function SentPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const { data: sentAlbums, error } = await supabase
    .from('albums')
    .select(`
      id,
      name,
      status,
      created_at,
      clients (full_name)
    `)
    .eq('photographer_id', user.id)
    .in('status', ['Aguardando Seleção', 'Seleção Completa'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sent albums:', error);
    return <div>Erro ao carregar os álbuns enviados.</div>
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Aguardando Seleção':
        return 'default';
      case 'Seleção Completa':
        return 'secondary';
      default:
        return 'outline';
    }
  };


  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Álbuns Enviados</h1>
        <p className="text-muted-foreground">
          Acompanhe o status dos álbuns que seus clientes estão selecionando.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status de Seleção ({sentAlbums.length})</CardTitle>
          <CardDescription>
            Lista de álbuns aguardando a seleção do cliente ou com seleção já finalizada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Álbum</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data de Envio</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentAlbums.length > 0 ? (
                sentAlbums.map((album) => (
                  <TableRow key={album.id}>
                    <TableCell className="font-medium">{album.name}</TableCell>
                    <TableCell>{album.clients?.full_name || 'N/A'}</TableCell>
                    <TableCell>
                      {isValid(new Date(album.created_at)) ? format(new Date(album.created_at), "dd 'de' MMM, yyyy", { locale: ptBR }) : 'Data inválida'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(album.status)}>{album.status}</Badge>
                    </TableCell>
                     <TableCell>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/album/${album.id}`}>Ver Álbum</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum álbum aguardando seleção no momento.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
