
import { getClientsForPhotographer } from "../actions";
import { ClientsDataTable } from "@/components/clients-data-table";

export default async function ClientsPage() {
    const { clients, error } = await getClientsForPhotographer();

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <p className="text-destructive">{error}</p>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline text-textDark">Seus Clientes</h1>
                <p className="text-muted-foreground">
                    Gerencie as informações de todos os seus clientes cadastrados.
                </p>
            </div>
            <ClientsDataTable data={clients} />
        </div>
    );
}
