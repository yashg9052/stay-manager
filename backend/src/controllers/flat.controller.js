import { pool } from '../config/db.js';
import { createError } from '../middlewares/error.middleware.js';
import validator from 'validator';

export const createFlat = async (req, res) => {
  const { name, address } = req.body;

  if (!name?.trim()) throw createError(400, 'name is required');
  if (!address?.trim()) throw createError(400, 'address is required');

  const { rows } = await pool.query(
    `INSERT INTO flats (name, address) VALUES ($1, $2) RETURNING *`,
    [name.trim(), address.trim()]
  );

  res.status(201).json({ success: true, data: rows[0] });
};

export const getAllFlats = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       f.*,
       COUNT(DISTINCT r.id)::int  AS room_count,
       COUNT(DISTINCT b.id)::int  AS bed_count,
       COUNT(DISTINCT CASE WHEN b.status = 'Occupied' THEN b.id END)::int AS occupied_beds
     FROM flats f
     LEFT JOIN rooms r ON r.flat_id = f.id
     LEFT JOIN beds  b ON b.room_id = r.id
     GROUP BY f.id
     ORDER BY f.created_at DESC`
  );

  res.json({ success: true, count: rows.length, data: rows });
};

export const getFlatById = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id)) throw createError(400, 'valid flat id is required');

  const { rows } = await pool.query(
    `SELECT
       f.*,
       COUNT(DISTINCT r.id)::int  AS room_count,
       COUNT(DISTINCT b.id)::int  AS bed_count,
       COUNT(DISTINCT CASE WHEN b.status = 'Occupied' THEN b.id END)::int AS occupied_beds
     FROM flats f
     LEFT JOIN rooms r ON r.flat_id = f.id
     LEFT JOIN beds  b ON b.room_id = r.id
     WHERE f.id = $1
     GROUP BY f.id`,
    [id]
  );

  if (!rows.length) throw createError(404, `Flat with id '${id}' not found`);

  res.json({ success: true, data: rows[0] });
};

export const deleteFlat = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id)) throw createError(400, 'valid flat id is required');

  const flatCheck = await pool.query(`SELECT id FROM flats WHERE id = $1`, [id]);
  if (!flatCheck.rows.length) throw createError(404, `Flat with id '${id}' not found`);

  const occupiedCheck = await pool.query(
    `SELECT COUNT(b.id)::int AS occupied_count
     FROM beds b
     JOIN rooms r ON r.id = b.room_id
     WHERE r.flat_id = $1 AND b.status = 'Occupied'`,
    [id]
  );

  const { occupied_count } = occupiedCheck.rows[0];
  if (occupied_count > 0) {
    throw createError(
      409,
      `Cannot delete flat — ${occupied_count} bed(s) are currently Occupied. Please vacate all tenants first.`
    );
  }

  await pool.query(`DELETE FROM flats WHERE id = $1`, [id]);

  res.json({ success: true, message: 'Flat deleted successfully' });
};