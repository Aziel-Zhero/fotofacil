
import { AlbumDetailClient } from './album-detail-client';

export interface Photo {
  id: string;
  url: string;
  name: string;
  dataAiHint: string;
}

export default function AlbumDetailPage({ params }: { params: { albumId: string } }) {
  // This is now a Server Component.
  // It safely accesses the params and passes the albumId to the Client Component.
  return <AlbumDetailClient albumId={params.albumId} />;
}
