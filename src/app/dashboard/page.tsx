import { AlbumCard } from '@/components/album-card';
import { Button } from '@/components/ui/button';
import { CreateAlbumDialog } from '@/components/create-album-dialog';
import { PlusCircle } from 'lucide-react';
import { ProfileCompletionDialog } from '@/components/profile-completion-dialog';

const mockAlbums = [
  { id: '1', name: 'Wedding in Tuscany', photoCount: 125, status: 'Awaiting Selection', client: 'The Smiths' },
  { id: '2', name: 'Corporate Headshots Q2', photoCount: 50, status: 'Selection Complete', client: 'Innovate Corp' },
  { id: '3', name: 'Newborn Session - Baby Leo', photoCount: 80, status: 'Expired', client: 'Jane Doe' },
  { id: '4', name: 'Autumn Family Photos', photoCount: 200, status: 'Awaiting Selection', client: 'The Williams Family' },
];


export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-headline">Your Albums</h1>
          <p className="text-muted-foreground">Manage your projects and client selections.</p>
        </div>
        <CreateAlbumDialog>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Album
          </Button>
        </CreateAlbumDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockAlbums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
      
      {/* This dialog will be triggered based on user state in a real app */}
      <ProfileCompletionDialog />
    </div>
  );
}
