import { pool } from '../config/db.js';

export const getDashboard = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       f.id AS flat_id,
       f.name AS flat,
       f.address,
       COUNT(DISTINCT r.id)::int AS total_rooms,
       COUNT(DISTINCT b.id)::int AS total_beds,
       COUNT(DISTINCT CASE WHEN b.status = 'Occupied' THEN b.id END)::int AS occupied,
       COUNT(DISTINCT CASE WHEN b.status = 'Available' THEN b.id END)::int AS available,
       COUNT(DISTINCT CASE WHEN b.status = 'Under Maintenance' THEN b.id END)::int AS under_maintenance,
       COUNT(DISTINCT t.id)::int AS total_tenants,
       CASE
         WHEN COUNT(DISTINCT b.id) = 0 THEN 0
         ELSE ROUND(
           COUNT(DISTINCT CASE WHEN b.status = 'Occupied' THEN b.id END)::numeric
           / COUNT(DISTINCT b.id)::numeric * 100, 2
         )
       END AS percentage
     FROM flats f
     LEFT JOIN rooms r ON r.flat_id = f.id
     LEFT JOIN beds b ON b.room_id = r.id
     LEFT JOIN tenants t ON t.bed_id = b.id
     GROUP BY f.id, f.name, f.address
     ORDER BY percentage DESC, f.name ASC`
  );

  const summary = {
    total_flats: rows.length,
    total_rooms: rows.reduce((s, r) => s + r.total_rooms, 0),
    total_beds: rows.reduce((s, r) => s + r.total_beds, 0),
    total_occupied: rows.reduce((s, r) => s + r.occupied, 0),
    total_available: rows.reduce((s, r) => s + r.available, 0),
    total_under_maintenance: rows.reduce((s, r) => s + r.under_maintenance, 0),
    total_tenants: rows.reduce((s, r) => s + r.total_tenants, 0),
    overall_occupancy_percentage:
      rows.reduce((s, r) => s + r.total_beds, 0) === 0
        ? 0
        : Math.round(
            (rows.reduce((s, r) => s + r.occupied, 0) /
              rows.reduce((s, r) => s + r.total_beds, 0)) *
              100 *
              100
          ) / 100,
  };

  res.json({ success: true, summary, data: rows });
};