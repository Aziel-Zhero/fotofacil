
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
import { AlertCircle, CheckCircle, Camera, User } from 'lucide-react';
  

export default async function TestePage() {
    const supabase = createClient(true);
    
    // Teste de conexão principal. Vamos tentar buscar fotógrafos.
    const { data: photographers, error: photographersError } = await supabase.from('photographers').select('*');
    const { data: clients, error: clientsError } = await supabase.from('clients').select('*');

    const connectionStatus = {
        success: !photographersError,
        message: photographersError ? photographersError.message : "A conexão com o banco de dados Supabase foi bem-sucedida.",
        details: photographersError ? `Código: ${photographersError.code} | Hint: ${photographersError.hint}` : null
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold font-headline">Painel de Controle (Teste)</h1>

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
                    <CardTitle className='flex items-center gap-2'><Camera className='h-5 w-5' /> Tabela `photographers`</CardTitle>
                    <CardDescription>Lista de todos os fotógrafos registrados no banco de dados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Telefone</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {connectionStatus.success && photographers && photographers.length > 0 ? (
                                photographers.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.full_name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.company_name}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
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
                                <TableHead>ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Telefone</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                             {connectionStatus.success && clients && clients.length > 0 ? (
                                clients.map((user: any) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{user.id}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.full_name}</TableCell>
                                        <TableCell>{user.phone}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        {connectionStatus.success ? "Nenhum cliente encontrado." : "Não é possível exibir os dados."}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}

