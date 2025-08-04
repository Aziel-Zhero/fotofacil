
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
import { AlertCircle, CheckCircle } from 'lucide-react';
  

export default async function TestePage() {
    // Usando o modo admin para garantir que a consulta não seja bloqueada por RLS.
    const supabase = createClient(true);
    
    // A tentativa de fazer um select já serve como um teste de conexão.
    const { data: profiles, error } = await supabase.from('profiles').select('*');

    const connectionStatus = {
        success: !error,
        message: error ? error.message : "A conexão com o banco de dados Supabase foi bem-sucedida.",
        details: error ? `Código: ${error.code} | Hint: ${error.hint}` : null
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <h1 className="text-3xl font-bold font-headline">Página de Teste e Depuração</h1>

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
                    <CardTitle>Tabela `profiles`</CardTitle>
                    <CardDescription>Lista de todos os usuários registrados no banco de dados.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[250px]">ID</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Nome Completo</TableHead>
                                <TableHead>Username</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Telefone</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Só exibe a tabela se a conexão for bem-sucedida */}
                            {connectionStatus.success && profiles && profiles.length > 0 ? (
                                profiles.map((profile: any) => (
                                    <TableRow key={profile.id}>
                                        <TableCell className="font-medium truncate max-w-xs">{profile.id}</TableCell>
                                        <TableCell>{profile.email}</TableCell>
                                        <TableCell>{profile.full_name}</TableCell>
                                        <TableCell>{profile.username}</TableCell>
                                        <TableCell>{profile.company_name}</TableCell>
                                        <TableCell>{profile.phone}</TableCell>
                                        <TableCell>{profile.role}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        {connectionStatus.success ? "Nenhum perfil encontrado. A tabela está vazia." : "Não é possível exibir os dados devido à falha na conexão."}
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
