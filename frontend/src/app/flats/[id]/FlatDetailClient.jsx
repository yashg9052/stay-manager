'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';

const STATUS_BADGE = {
  Available:           'badge-green',
  Occupied:            'badge-blue',
  'Under Maintenance': 'badge-amber',
};

export default function FlatDetailClient({ flat, rooms, bedsByRoom, tenants }) {
  const router = useRouter();

  const [showRoomModal, setShowRoomModal]   = useState(false);
  const [roomForm, setRoomForm]             = useState({ name: '', capacity: '' });
  const [roomSaving, setRoomSaving]         = useState(false);
  const [roomError, setRoomError]           = useState('');

  const [showBedModal, setShowBedModal]     = useState(null);
  const [bedSaving, setBedSaving]           = useState(false);
  const [bedError, setBedError]             = useState('');

  const [statusModal, setStatusModal]       = useState(null);
  const [statusSaving, setStatusSaving]     = useState(false);
  const [statusError, setStatusError]       = useState('');

  const [assignModal, setAssignModal]       = useState(null);
  const [assignTenantId, setAssignTenantId] = useState('');
  const [assignSaving, setAssignSaving]     = useState(false);
  const [assignError, setAssignError]       = useState('');

  const [unassignTarget, setUnassignTarget] = useState(null);
  const [unassignSaving, setUnassignSaving] = useState(false);

  async function handleCreateRoom(e) {
    e.preventDefault();
    setRoomError('');
    setRoomSaving(true);
    try {
      await api.rooms.create({ flat_id: flat.id, name: roomForm.name, capacity: Number(roomForm.capacity) });
      setRoomForm({ name: '', capacity: '' });
      setShowRoomModal(false);
      router.refresh();
    } catch (err) {
      setRoomError(err.message);
    } finally {
      setRoomSaving(false);
    }
  }

  async function handleDeleteRoom(roomId) {
    if (!confirm('Delete this room? All its beds will be removed.')) return;
    try {
      await api.rooms.delete(roomId);
      router.refresh();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleAddBed() {
    setBedError('');
    setBedSaving(true);
    try {
      await api.beds.create({ room_id: showBedModal });
      setShowBedModal(null);
      router.refresh();
    } catch (err) {
      setBedError(err.message);
    } finally {
      setBedSaving(false);
    }
  }

  async function handleUpdateStatus(status) {
    setStatusError('');
    setStatusSaving(true);
    try {
      await api.beds.updateStatus(statusModal.id, status);
      setStatusModal(null);
      router.refresh();
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setStatusSaving(false);
    }
  }

  async function handleAssign(e) {
    e.preventDefault();
    setAssignError('');
    setAssignSaving(true);
    try {
      await api.tenants.assign({ tenant_id: assignTenantId, bed_id: assignModal.id });
      setAssignModal(null);
      setAssignTenantId('');
      router.refresh();
    } catch (err) {
      setAssignError(err.message);
    } finally {
      setAssignSaving(false);
    }
  }

  async function handleUnassign() {
    setUnassignSaving(true);
    try {
      await api.tenants.unassign({ tenant_id: unassignTarget.tenant_id });
      setUnassignTarget(null);
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setUnassignSaving(false);
    }
  }

  const availableTenants = tenants.filter((t) => !t.bed_id);
  const assignedElsewhere = tenants.filter((t) => t.bed_id);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link href="/flats" style={{ fontSize: 13, color: 'var(--text3)' }}>← Flats</Link>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 8 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: 'var(--text)' }}>{flat.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 2 }}>{flat.address}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setRoomError(''); setShowRoomModal(true); }}>
            + Add room
          </button>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>
          <span>{flat.room_count} rooms</span>
          <span>{flat.bed_count} beds</span>
          <span style={{ color: 'var(--blue)' }}>{flat.occupied_beds} occupied</span>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="card empty-state">No rooms yet. Add a room to this flat.</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {rooms.map((room) => {
            const roomBeds = bedsByRoom[room.id] || [];
            return (
              <div key={room.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 15, color: 'var(--text)' }}>{room.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                      Capacity: {roomBeds.length}/{room.capacity} beds
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-sm"
                      disabled={roomBeds.length >= room.capacity}
                      onClick={() => { setBedError(''); setShowBedModal(room.id); }}
                    >+ Add bed</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRoom(room.id)}>
                      Delete room
                    </button>
                  </div>
                </div>

                {roomBeds.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--text3)' }}>No beds in this room.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {roomBeds.map((bed) => (
                      <div key={bed.id} style={{
                        background: 'var(--bg2)',
                        border: '0.5px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '12px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'monospace' }}>
                            {bed.id.slice(0, 8)}…
                          </span>
                          <span className={`badge ${STATUS_BADGE[bed.status]}`}>{bed.status}</span>
                        </div>

                        {bed.tenant_id ? (
                          <div style={{ marginBottom: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{bed.tenant_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{bed.tenant_email}</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Unoccupied</div>
                        )}

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {bed.status === 'Available' && (
                            <button
                              className="btn btn-sm"
                              onClick={() => { setAssignError(''); setAssignTenantId(''); setAssignModal(bed); }}
                            >Assign</button>
                          )}
                          {bed.tenant_id && (
                            <button className="btn btn-sm btn-danger" onClick={() => setUnassignTarget(bed)}>
                              Unassign
                            </button>
                          )}
                          {!bed.tenant_id && (
                            <button
                              className="btn btn-sm"
                              onClick={() => { setStatusError(''); setStatusModal(bed); }}
                            >Status</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showRoomModal && (
        <Modal title="Add room" onClose={() => setShowRoomModal(false)}>
          {roomError && <div className="error-msg">{roomError}</div>}
          <form onSubmit={handleCreateRoom}>
            <div className="form-group">
              <label className="label">Room name</label>
              <input
                value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                placeholder="e.g. Room A"
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="label">Bed capacity</label>
              <input
                type="number" min="1"
                value={roomForm.capacity}
                onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                placeholder="e.g. 4"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button type="button" className="btn" onClick={() => setShowRoomModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={roomSaving}>
                {roomSaving ? 'Saving…' : 'Create room'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showBedModal && (
        <Modal title="Add bed" onClose={() => setShowBedModal(null)} width={360}>
          {bedError && <div className="error-msg">{bedError}</div>}
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            Add one bed to this room. Its initial status will be Available.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setShowBedModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAddBed} disabled={bedSaving}>
              {bedSaving ? 'Adding…' : 'Add bed'}
            </button>
          </div>
        </Modal>
      )}

      {statusModal && (
        <Modal title="Update bed status" onClose={() => setStatusModal(null)} width={360}>
          {statusError && <div className="error-msg">{statusError}</div>}
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 16 }}>
            Current: <span className={`badge ${STATUS_BADGE[statusModal.status]}`}>{statusModal.status}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {['Available', 'Under Maintenance'].map((s) => (
              <button
                key={s}
                className="btn"
                disabled={statusModal.status === s || statusSaving}
                onClick={() => handleUpdateStatus(s)}
                style={{ justifyContent: 'flex-start' }}
              >
                <span className={`badge ${STATUS_BADGE[s]}`}>{s}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {assignModal && (
        <Modal title="Assign tenant to bed" onClose={() => setAssignModal(null)}>
          {assignError && <div className="error-msg">{assignError}</div>}
          <form onSubmit={handleAssign}>
            <div className="form-group">
              <label className="label">Select tenant</label>
              <select
                value={assignTenantId}
                onChange={(e) => setAssignTenantId(e.target.value)}
                required
              >
                <option value="">— choose tenant —</option>
                {availableTenants.length > 0 && (
                  <optgroup label="Unassigned">
                    {availableTenants.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </optgroup>
                )}
                {assignedElsewhere.length > 0 && (
                  <optgroup label="Reassign from another bed">
                    {assignedElsewhere.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} — {t.room_name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
              If the tenant is already assigned elsewhere, they will be automatically moved.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button type="button" className="btn" onClick={() => setAssignModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={assignSaving || !assignTenantId}>
                {assignSaving ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {unassignTarget && (
        <Modal title="Unassign tenant" onClose={() => setUnassignTarget(null)} width={380}>
          <p style={{ fontSize: 14, color: 'var(--text2)', marginBottom: 20 }}>
            Remove <strong style={{ color: 'var(--text)' }}>{unassignTarget.tenant_name}</strong> from this bed?
            The bed will be set to Available.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn" onClick={() => setUnassignTarget(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleUnassign} disabled={unassignSaving}>
              {unassignSaving ? 'Removing…' : 'Unassign'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}