import { pool } from '../config/db.js';
import { createError } from '../middlewares/error.middleware.js';
import validator from 'validator';

const VALID_STATUSES = ['Available', 'Occupied', 'Under Maintenance'];

export const createBed = async (req, res) => {
  const { room_id } = req.body;

  if (!room_id || !validator.isUUID(room_id)) throw createError(400, 'valid room_id is required');

  const roomCheck = await pool.query(
    `SELECT id, capacity FROM rooms WHERE id = $1`,
    [room_id]
  );
  if (!roomCheck.rows.length)
    throw createError(404, `Room with id '${room_id}' not found`);

  const { capacity } = roomCheck.rows[0];

  const bedCount = await pool.query(
    `SELECT COUNT(id)::int AS total FROM beds WHERE room_id = $1`,
    [room_id]
  );
  const currentBeds = bedCount.rows[0].total;

  if (currentBeds >= capacity) {
    throw createError(
      409,
      `Cannot add bed — room is at full capacity (${capacity}/${capacity} beds). Increase room capacity or use a different room.`
    );
  }

  const { rows } = await pool.query(
    `INSERT INTO beds (room_id) VALUES ($1) RETURNING *`,
    [room_id]
  );

  res.status(201).json({ success: true, data: rows[0] });
};

export const getBeds = async (req, res) => {
  const { room_id } = req.query;

  let query = `
    SELECT
      b.*,
      t.id   AS tenant_id,
      t.name AS tenant_name,
      t.email AS tenant_email
    FROM beds b
    LEFT JOIN tenants t ON t.bed_id = b.id
  `;
  const params = [];

  if (room_id) {
    if (!validator.isUUID(room_id)) throw createError(400, 'valid room_id is required');

    const roomCheck = await pool.query(`SELECT id FROM rooms WHERE id = $1`, [room_id]);
    if (!roomCheck.rows.length)
      throw createError(404, `Room with id '${room_id}' not found`);

    query += ` WHERE b.room_id = $1`;
    params.push(room_id);
  }

  query += ` ORDER BY b.created_at ASC`;

  const { rows } = await pool.query(query, params);
  res.json({ success: true, count: rows.length, data: rows });
};

export const updateBedStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!validator.isUUID(id)) throw createError(400, 'valid bed id is required');
  if (!status) throw createError(400, 'status is required');
  if (!VALID_STATUSES.includes(status)) {
    throw createError(
      400,
      `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
    );
  }

  const bedCheck = await pool.query(
    `SELECT b.*, t.id AS tenant_id FROM beds b LEFT JOIN tenants t ON t.bed_id = b.id WHERE b.id = $1`,
    [id]
  );
  if (!bedCheck.rows.length)
    throw createError(404, `Bed with id '${id}' not found`);

  const bed = bedCheck.rows[0];

  if (status === 'Occupied') {
    throw createError(
      400,
      `Status 'Occupied' is set automatically when a tenant is assigned. Use POST /api/tenants/assign to assign a tenant.`
    );
  }

  if (bed.tenant_id) {
    throw createError(
      409,
      `Cannot change bed status — bed is currently occupied by a tenant. Remove the tenant first.`
    );
  }

  const { rows } = await pool.query(
    `UPDATE beds SET status = $1 WHERE id = $2 RETURNING *`,
    [status, id]
  );

  res.json({ success: true, data: rows[0] });
};