'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

export default function TenantsClient({ initialTenants }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const tenants = initialTenants;
  const assigned = tenants.filter((t) => t.bed_id);
  const unassigned = tenants.filter((t) => !t.bed_id);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.tenants.create(form);
      setForm({ name: '', email: '' });
      setShowCreate(false);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.tenants.delete(deleteTarget.id);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleUnassign(tenant) {
    if (!confirm(`Remove ${tenant.name} from their current bed?`)) return;
    try {
      await api.tenants.unassign({ tenant_id: tenant.id });
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>Tenants</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>
            {tenants.length} tenant{tenants.length !== 1 ? 's' : ''} — {assigned.length} assigned, {unassigned.length} unassigned
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setError(''); setShowCreate(true); }}>
          + Add tenant
        </button>
      </div>

      {tenants.length === 0 ? (
        <div className="card empty-state">No tenants yet.</div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {tenants.map((tenant) => (
            <div key={tenant.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px' }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--bg3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 500, color: 'var(--text2)',
                flexShrink: 0,
              }}>
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: 'var(--text)' }}>{tenant.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>{tenant.email}</div>
              </div>

              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                {tenant.bed_id ? (
                  <div>
                    <span className="badge badge-blue" style={{ marginBottom: 2 }}>Assigned</span>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
                      {tenant.flat_name} › {tenant.room_name}
                    </div>
                  </div>
                ) : (
                  <span className="badge badge-gray">Unassigned</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {tenant.bed_id && (
                  <button className="btn btn-sm" onClick={() => handleUnassign(tenant)}>
                    Unassign
                  </button>
                )}
                <button
                  className="btn btn-sm btn-danger"
                  disabled={!!tenant.bed_id}
                  title={tenant.bed_id ? 'Unassign tenant before deleting' : ''}
                  onClick={() => setDeleteTarget(tenant)}
                >Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Add tenant" onClose={() => setShowCreate(false)}>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="label">Full name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Aarav Shah"
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. aarav@example.com"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Create tenant'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete tenant" onClose={() => setDeleteTarget(null)} width={380}>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            Permanently delete <strong style={{ color: 'var(--text)' }}>{deleteTarget.name}</strong>?
            This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}