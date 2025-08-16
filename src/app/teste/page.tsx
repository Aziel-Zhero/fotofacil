
import { createClient } from '@/lib/supabase/server';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Camera, User, Database, Lock, Album, ImageIcon, CheckSquare, Bell, Download, FileText } from 'lucide-react';
  

export default async function TestePage() {
    const supabase = createClient(true);
    
    // Teste de conexão principal e busca de dados
    const { data: { users: authUsers }, error: authUsersError } = await supabase.auth.admin.listUsers();
    const { data: photographers, error: photographersError } = await supabase.from('photographers').select('*');
    const { data: clients, error: clientsError } = await supabase.from('clients').select('*');
    const { data: albums, error: albumsError } = await supabase.from('albums').select('*');
    const { data: photos, error: photosError } = await supabase.from('photos').select('*');
    const { data: selections, error: selectionsError } = await supabase.from('album_selections').select('*');
    const { data: notifications, error: notificationsError } = await supabase.from('notifications').select('*');
    const { data: downloads, error: downloadsError } = await supabase.from('album_downloads').select('*');
    const { data: invoices, error: invoicesError } = await supabase.from('invoices').select('*');
    const { data: subscriptions, error: subscriptionsError } = await supabase.from('subscriptions').select('*');

    const connectionError = authUsersError || photographersError || clientsError || albumsError || photosError || selectionsError || notificationsError || downloadsError || invoicesError || subscriptionsError;

    const connectionStatus = {
        success: !connectionError,
        message: connectionError ? connectionError.message : "A conexão com o banco de dados Supabase foi bem-sucedida e todas as tabelas foram consultadas.",
        details: connectionError ? `Código: ${connectionError.code} | Hint: ${connectionError.hint}` : null
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold font-headline">Super Painel de Controle (Teste)</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {connectionStatus.success ? (
                            <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                            <AlertCircle className="h-6 w-6 text-destructive" />
                        )}
                        Verificação de Conexão com o Banco
                    </CardTitle>
                    <CardDescription>
                        Este painel verifica se a aplicação consegue se comunicar com o banco de dados Supabase com privilégios de administrador (service_role).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={connectionStatus.success ? "text-green-600" : "text-destructive"}>
                        <p className="font-bold">Status: {connectionStatus.success ? "Conexão Bem-sucedida" : "Falha na Conexão"}</p>
                        <p className="text-sm">{connectionStatus.message}</p>
                        {connectionStatus.details && (
                             <p className="text-xs mt-1">{connectionStatus.details}</p>
                        )}
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Lock className='h-5 w-5' /> Tabela `auth.users`</CardTitle>
                    <CardDescription>Coração do sistema. Lista de todos os usuários que podem se autenticar.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Criado em</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {authUsers && authUsers.length > 0 ? (
                                authUsers.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.user_metadata?.role || 'N/A'}</TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        {connectionStatus.success ? "Nenhum usuário de autenticação encontrado." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Camera className='h-5 w-5' /> Tabela `photographers`</CardTitle>
                    <CardDescription>Lista de todos os fotógrafos registrados no banco de dados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID (FK de auth.users)</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Empresa</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {photographers && photographers.length > 0 ? (
                                photographers.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.full_name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.company_name}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        {connectionStatus.success ? "Nenhum fotógrafo encontrado." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><User className='h-5 w-5' /> Tabela `clients`</CardTitle>
                    <CardDescription>Lista de todos os clientes registrados no banco de dados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID (FK de auth.users)</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>ID do Fotógrafo (FK)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {clients && clients.length > 0 ? (
                                clients.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.full_name}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                        <TableCell className="truncate max-w-xs">{user.photographer_id}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        {connectionStatus.success ? "Nenhum cliente encontrado." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Album className='h-5 w-5' /> Tabela `albums`</CardTitle>
                    <CardDescription>Todos os álbuns criados na plataforma.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID do Álbum</TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>ID do Fotógrafo</TableHead>
                                <TableHead>ID do Cliente</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {albums && albums.length > 0 ? (
                                albums.map((album: any) => (
                                    <TableRow key={album.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{album.id}</TableCell>
                                        <TableCell>{album.name}</TableCell>
                                        <TableCell>{album.status}</TableCell>
                                        <TableCell className="truncate max-w-xs">{album.photographer_id}</TableCell>
                                        <TableCell className="truncate max-w-xs">{album.client_id}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                       {connectionStatus.success ? "Nenhum álbum encontrado." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><ImageIcon className='h-5 w-5' /> Tabela `photos`</CardTitle>
                    <CardDescription>Todas as fotos enviadas para todos os álbuns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID da Foto</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>ID do Álbum (FK)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {photos && photos.length > 0 ? (
                                photos.map((photo: any) => (
                                    <TableRow key={photo.id}>
                                        <TableCell className="font-medium">{photo.id}</TableCell>
                                        <TableCell className="truncate max-w-xs">{photo.url}</TableCell>
                                        <TableCell className="truncate max-w-xs">{photo.album_id}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                       {connectionStatus.success ? "Nenhuma foto encontrada." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            {/* Adicionando as outras tabelas */}

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><CheckSquare className='h-5 w-5' /> Tabela `album_selections`</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID do Álbum</TableHead><TableHead>ID da Foto</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {selections && selections.length > 0 ? selections.map((item: any) => (<TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.album_id}</TableCell><TableCell>{item.photo_id}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhum registro</TableCell></TableRow>}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Bell className='h-5 w-5' /> Tabela `notifications`</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID do Usuário</TableHead><TableHead>Mensagem</TableHead><TableHead>Lida</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {notifications && notifications.length > 0 ? notifications.map((item: any) => (<TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.user_id}</TableCell><TableCell>{item.message}</TableCell><TableCell>{String(item.is_read)}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registro</TableCell></TableRow>}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Download className='h-5 w-5' /> Tabela `album_downloads`</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID do Álbum</TableHead><TableHead>ID do Usuário</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {downloads && downloads.length > 0 ? downloads.map((item: any) => (<TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.album_id}</TableCell><TableCell>{item.user_id}</TableCell><TableCell>{new Date(item.downloaded_at).toLocaleString()}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registro</TableCell></TableRow>}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><FileText className='h-5 w-5' /> Tabela `invoices`</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>ID do Usuário</TableHead><TableHead>Valor</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {invoices && invoices.length > 0 ? invoices.map((item: any) => (<TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.user_id}</TableCell><TableCell>R$ {item.amount}</TableCell><TableCell>{item.status}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhum registro</TableCell></TableRow>}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'><Database className='h-5 w-5' /> Tabela `subscriptions`</CardTitle>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nome</TableHead><TableHead>Preço</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {subscriptions && subscriptions.length > 0 ? subscriptions.map((item: any) => (<TableRow key={item.id}><TableCell>{item.id}</TableCell><TableCell>{item.name}</TableCell><TableCell>R$ {item.price}</TableCell></TableRow>)) : <TableRow><TableCell colSpan={3} className="h-24 text-center">Nenhum registro</TableCell></TableRow>}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>

        </div>
    )
}
