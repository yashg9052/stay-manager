const BASE = "https://stay-manager.onrender.com"

async function request(path, options = {}) {
  const res = await fetch(`${BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  } catch {
    console.error("RAW RESPONSE:", text);
    throw new Error("Invalid JSON response");
  }
}

export const api = {
  flats: {
    list: () => request('/flats'),
    create: (body) => request('/flats', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/flats/${id}`, { method: 'DELETE' }),
  },
  rooms: {
    list: (flatId) => request(`/rooms?flat_id=${flatId}`),
    create: (body) => request('/rooms', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' }),
  },
  beds: {
    list: (roomId) => request(`/beds?room_id=${roomId}`),
    create: (body) => request('/beds', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, status) =>
      request(`/beds/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  tenants: {
    create: (body) => request('/tenants', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/tenants/${id}`, { method: 'DELETE' }),
    assign: (body) => request('/tenants/assign', { method: 'POST', body: JSON.stringify(body) }),
    unassign: (body) => request('/tenants/unassign', { method: 'POST', body: JSON.stringify(body) }),
  },
};