
import { AlbumDetailClient } from './album-detail-client';

export default function AlbumDetailPage({ params }: { params: { albumId: string } }) {
  // This is now a Server Component.
  // It safely accesses the params and passes the albumId to the Client Component.
  return <AlbumDetailClient albumId={params.albumId} />;
}
