
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ClientActions } from '@/components/client-actions';

export type ClientData = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  albums: {
    id: string;
    name: string | null;
  }[];
};

async function getClientsData(photographerId: string): Promise<ClientData[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select(`
      id,
      full_name,
      email,
      phone,
      albums (
        id,
        name
      )
    `)
    .eq('photographer_id', photographerId);
  
  if (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
  return data;
}

export default async function ClientsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  const clients = await getClientsData(user.id);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Gerenciamento de Clientes</h1>
        <p className="text-muted-foreground">
          Visualize, edite e gerencie todos os seus clientes em um só lugar.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Clientes ({clients.length})</CardTitle>
          <CardDescription>
            Lista de todos os clientes vinculados à sua conta de fotógrafo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Álbuns Vinculados</TableHead>
                <TableHead><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length > 0 ? (
                clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.full_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{client.email}</span>
                        <span className="text-xs text-muted-foreground">{client.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.albums.length > 0 ? (
                          client.albums.map(album => <Badge key={album.id} variant="secondary">{album.name}</Badge>)
                        ) : (
                          <span className="text-xs text-muted-foreground">Nenhum</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ClientActions client={client} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Nenhum cliente cadastrado ainda.
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
