import { serverApi } from '@/lib/api.server';
import FlatDetailClient from './FlatDetailClient';

export default async function FlatDetailPage({ params }) {
  const { id } = await params;

  const [flat, rooms, tenants] = await Promise.all([
    serverApi.flats.get(id),
    serverApi.rooms.list(id),
    serverApi.tenants.list(),
  ]);

  const bedsByRoom = Object.fromEntries(
    await Promise.all(
      rooms.map(async (room) => {
        const beds = await serverApi.beds.list(room.id);
        return [room.id, beds];
      })
    )
  );

  return (
    <FlatDetailClient
      flat={flat}
      rooms={rooms}
      bedsByRoom={bedsByRoom}
      tenants={tenants}
    />
  );
}