
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
  

export default async function TestePage() {
    const supabase = createClient();
    const { data: profiles, error } = await supabase.from('profiles').select('*');

    if (error) {
        return <div className="container mx-auto py-8 text-destructive">Erro ao buscar perfis: {error.message}</div>
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold font-headline mb-8">Usuários Cadastrados (Tabela Profiles)</h1>
            <Table>
                <TableCaption>Lista de todos os usuários registrados no banco de dados.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Nome Completo</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Role</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {profiles && profiles.length > 0 ? (
                        profiles.map((profile) => (
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
                            <TableCell colSpan={7} className="text-center">Nenhum perfil encontrado.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

