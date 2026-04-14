'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

const occupancyColor = (pct) =>
  pct >= 90 ? 'var(--red)' : pct >= 60 ? 'var(--amber)' : 'var(--green)';

export default function FlatsClient({ initialFlats }) {
  const router = useRouter();
  const [flats, setFlats] = useState(initialFlats);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', address: '' });
  const [saving, setSaving] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.flats.create(form);
      setForm({ name: '', address: '' });
      setShowCreate(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setError('');
    setSaving(true);
    try {
      await api.flats.delete(deleteTarget.id);
      setDeleteTarget(null);
      setConfirmText('');
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>Flats</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
            {flats.length} flat{flats.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowCreate(true); }}>
          + Add flat
        </button>
      </div>

      {flats.length === 0 ? (
        <div className="card empty-state">No flats yet. Create one to get started.</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {flats.map((flat) => {
            const pct = flat.bed_count > 0
              ? Math.round((flat.occupied_beds / flat.bed_count) * 100)
              : 0;
            const color = occupancyColor(pct);
            return (
              <div key={flat.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link href={`/flats/${flat.id}`} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>{flat.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {flat.address}
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
                    <span>{flat.room_count} room{flat.room_count !== 1 ? 's' : ''}</span>
                    <span>{flat.bed_count} bed{flat.bed_count !== 1 ? 's' : ''}</span>
                    <span style={{ color, fontWeight: 500 }}>
                      {flat.occupied_beds}/{flat.bed_count} occupied ({pct}%)
                    </span>
                  </div>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `conic-gradient(${color} ${pct * 3.6}deg, var(--bg3) 0)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'var(--bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 500, color,
                    }}>{pct}%</div>
                  </div>
                  <Link href={`/flats/${flat.id}`} className="btn btn-sm">View →</Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => { setError(''); setDeleteTarget(flat); setConfirmText(''); }}
                  >Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <Modal title="Add flat" onClose={() => setShowCreate(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="label">Flat name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sunset Villa"
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label">Address</label>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. 12 MG Road, Mumbai"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create flat'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete flat" onClose={() => setDeleteTarget(null)} width={400}>
          {error && <div className="error-msg">{error}</div>}
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
            This will permanently delete <strong style={{ color: 'var(--text)' }}>{deleteTarget.name}</strong> and all its rooms and beds.
            {deleteTarget.occupied_beds > 0 && (
              <span style={{ display: 'block', marginTop: 8, color: 'var(--red)' }}>
                Warning: {deleteTarget.occupied_beds} bed(s) are currently occupied. You must vacate them before deleting.
              </span>
            )}
          </p>
          <div className="form-group">
            <label className="label">Type the flat name to confirm</label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={deleteTarget.name}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button
              className="btn btn-danger"
              disabled={confirmText !== deleteTarget.name || saving}
              onClick={handleDelete}
            >
              {saving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
} 