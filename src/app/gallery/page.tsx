import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import Link from "next/link";

const mockClientAlbums = [
    { id: '1', name: 'Wedding in Tuscany', photographer: 'Anna Belle' },
    { id: '4', name: 'Autumn Family Photos', photographer: 'John Smith' },
]

export default function ClientGalleryPage() {
    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
            <header className="bg-background border-b">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="font-headline text-xl font-bold">PhotoFolio Flow</Link>
                    <p className="text-sm text-muted-foreground">Client View</p>
                </div>
            </header>
            <main className="flex-1 p-8">
                <div className="container">
                    <h1 className="text-3xl font-bold font-headline mb-2">Your Shared Albums</h1>
                    <p className="text-muted-foreground mb-8">Here are the albums shared with you. Click one to start your selection.</p>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mockClientAlbums.map(album => (
                            <Card key={album.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <ImageIcon className="w-10 h-10 text-primary mb-2"/>
                                    <CardTitle className="font-headline">{album.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">From: {album.photographer}</p>
                                    <Link href="#" className="text-primary font-semibold mt-4 inline-block">View Album &rarr;</Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
