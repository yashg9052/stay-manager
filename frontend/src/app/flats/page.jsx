import { serverApi } from '@/lib/api.server';
import FlatsClient from './FlatsClient';

export default async function FlatsPage() {
  const flats = await serverApi.flats.list();
  return <FlatsClient initialFlats={flats} />;
}