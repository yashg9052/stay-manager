const BASE = "https://stay-manager.onrender.com"
console.log(BASE)
async function get(path) {
  const res = await fetch(`${BASE}/api${path}`, {   // ✅ added /api
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const text = await res.text();

  try {
    const json = JSON.parse(text);
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json.data;
  } catch {
    console.error("RAW RESPONSE:", text);
    throw new Error("Invalid JSON response");
  }
}

export const serverApi = {
  flats: {
    list: () => get('/flats'),
    get: (id) => get(`/flats/${id}`),
  },
  rooms: {
    list: (flatId) => get(`/rooms?flat_id=${flatId}`),
  },
  beds: {
    list: (roomId) => get(`/beds?room_id=${roomId}`),
  },
  tenants: {
    list: () => get('/tenants'),
  },
  dashboard: {
    get: async () => {
      const res = await fetch(`${BASE}/api/dashboard`, {  // ✅ added /api
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
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
    },
  },
};