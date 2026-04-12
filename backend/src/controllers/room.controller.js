import { pool } from '../config/db.js';
import { createError } from '../middlewares/error.middleware.js';
import validator from 'validator';

export const createRoom = async (req, res) => {
  const { flat_id, name, capacity } = req.body;

  if (!flat_id || !validator.isUUID(flat_id)) throw createError(400, 'valid flat_id is required');
  if (!name?.trim()) throw createError(400, 'name is required');
  if (!capacity || isNaN(capacity) || Number(capacity) < 1)
    throw createError(400, 'capacity must be a positive integer');

  const flatCheck = await pool.query(`SELECT id FROM flats WHERE id = $1`, [flat_id]);
  if (!flatCheck.rows.length)
    throw createError(404, `Flat with id '${flat_id}' not found`);

  const { rows } = await pool.query(
    `INSERT INTO rooms (flat_id, name, capacity) VALUES ($1, $2, $3) RETURNING *`,
    [flat_id, name.trim(), Number(capacity)]
  );

  res.status(201).json({ success: true, data: rows[0] });
};

export const getRooms = async (req, res) => {
  const { flat_id } = req.query;

  let query = `
    SELECT
      r.*,
      COUNT(b.id)::int AS bed_count,
      COUNT(CASE WHEN b.status = 'Available'         THEN 1 END)::int AS available_beds,
      COUNT(CASE WHEN b.status = 'Occupied'          THEN 1 END)::int AS occupied_beds,
      COUNT(CASE WHEN b.status = 'Under Maintenance' THEN 1 END)::int AS maintenance_beds
    FROM rooms r
    LEFT JOIN beds b ON b.room_id = r.id
  `;
  const params = [];

  if (flat_id) {
    if (!validator.isUUID(flat_id)) throw createError(400, 'valid flat_id is required');

    const flatCheck = await pool.query(`SELECT id FROM flats WHERE id = $1`, [flat_id]);
    if (!flatCheck.rows.length)
      throw createError(404, `Flat with id '${flat_id}' not found`);

    query += ` WHERE r.flat_id = $1`;
    params.push(flat_id);
  }

  query += ` GROUP BY r.id ORDER BY r.created_at DESC`;

  const { rows } = await pool.query(query, params);
  res.json({ success: true, count: rows.length, data: rows });
};

export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id)) throw createError(400, 'valid room id is required');

  const roomCheck = await pool.query(`SELECT id FROM rooms WHERE id = $1`, [id]);
  if (!roomCheck.rows.length)
    throw createError(404, `Room with id '${id}' not found`);

  const occupiedCheck = await pool.query(
    `SELECT COUNT(id)::int AS occupied_count FROM beds WHERE room_id = $1 AND status = 'Occupied'`,
    [id]
  );

  const { occupied_count } = occupiedCheck.rows[0];
  if (occupied_count > 0) {
    throw createError(
      409,
      `Cannot delete room — ${occupied_count} bed(s) are currently Occupied. Please vacate all tenants first.`
    );
  }

  await pool.query(`DELETE FROM rooms WHERE id = $1`, [id]);

  res.json({ success: true, message: 'Room deleted successfully' });
};