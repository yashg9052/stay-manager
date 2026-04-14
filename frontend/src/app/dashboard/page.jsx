import Link from 'next/link';
import { serverApi } from '@/lib/api.server';

function OccupancyBar({ pct }) {
  const color = pct >= 90 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>
        <span>Occupancy</span>
        <span style={{ color, fontWeight: 500 }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 5, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const { summary, data: flats } = await serverApi.dashboard.get();

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>Dashboard</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>Occupancy overview across all flats</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Total flats',  value: summary.total_flats               },
          { label: 'Total rooms',  value: summary.total_rooms               },
          { label: 'Total beds',   value: summary.total_beds                },
          { label: 'Occupied',     value: summary.total_occupied            },
          { label: 'Available',    value: summary.total_available           },
          { label: 'Maintenance',  value: summary.total_under_maintenance   },
          { label: 'Tenants',      value: summary.total_tenants             },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'var(--bg2)', borderRadius: 'var(--radius)', padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)' }}>Per flat</h2>
        <span style={{ fontSize: 12, color: 'var(--text3)' }}>
          Overall: {summary.overall_occupancy_percentage}% occupied
        </span>
      </div>

      {flats.length === 0 ? (
        <div className="card empty-state">No flats yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {flats.map((flat) => (
            <div key={flat.flat_id} className="card">
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/flats/${flat.flat_id}`} style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>
                    {flat.flat}
                  </Link>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{flat.address}</div>
                  <OccupancyBar pct={Number(flat.percentage)} />
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[
                    { label: 'Rooms',       value: flat.total_rooms,       color: 'var(--text)'  },
                    { label: 'Beds',        value: flat.total_beds,        color: 'var(--text)'  },
                    { label: 'Occupied',    value: flat.occupied,          color: 'var(--blue)'  },
                    { label: 'Available',   value: flat.available,         color: 'var(--green)' },
                    { label: 'Maintenance', value: flat.under_maintenance, color: 'var(--amber)' },
                    { label: 'Tenants',     value: flat.total_tenants,     color: 'var(--text)'  },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ textAlign: 'center', minWidth: 48 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color }}>{value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}