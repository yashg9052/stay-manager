import { serverApi } from '@/lib/api.server';
import TenantsClient from './TenantsClient';

export default async function TenantsPage() {
  const tenants = await serverApi.tenants.list();
  return <TenantsClient initialTenants={tenants} />;
}