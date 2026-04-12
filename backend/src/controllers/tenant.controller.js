import { pool } from '../config/db.js';
import { createError } from '../middlewares/error.middleware.js';
import validator from 'validator';

export const createTenant = async (req, res) => {
  const { name, email } = req.body;

  if (!name?.trim()) throw createError(400, 'name is required');
  if (!email?.trim()) throw createError(400, 'email is required');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) throw createError(400, 'email is invalid');

  const emailCheck = await pool.query(`SELECT id FROM tenants WHERE email = $1`, [email.trim().toLowerCase()]);
  if (emailCheck.rows.length) throw createError(409, `A tenant with email '${email}' already exists`);

  const { rows } = await pool.query(
    `INSERT INTO tenants (name, email) VALUES ($1, $2) RETURNING *`,
    [name.trim(), email.trim().toLowerCase()]
  );

  res.status(201).json({ success: true, data: rows[0] });
};

export const getAllTenants = async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       t.*,
       b.status        AS bed_status,
       r.id            AS room_id,
       r.name          AS room_name,
       f.id            AS flat_id,
       f.name          AS flat_name
     FROM tenants t
     LEFT JOIN beds  b ON b.id = t.bed_id
     LEFT JOIN rooms r ON r.id = b.room_id
     LEFT JOIN flats f ON f.id = r.flat_id
     ORDER BY t.created_at DESC`
  );

  res.json({ success: true, count: rows.length, data: rows });
};

export const getTenantById = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id)) throw createError(400, 'valid tenant id is required');

  const { rows } = await pool.query(
    `SELECT
       t.*,
       b.status        AS bed_status,
       r.id            AS room_id,
       r.name          AS room_name,
       f.id            AS flat_id,
       f.name          AS flat_name
     FROM tenants t
     LEFT JOIN beds  b ON b.id = t.bed_id
     LEFT JOIN rooms r ON r.id = b.room_id
     LEFT JOIN flats f ON f.id = r.flat_id
     WHERE t.id = $1`,
    [id]
  );

  if (!rows.length) throw createError(404, `Tenant with id '${id}' not found`);

  res.json({ success: true, data: rows[0] });
};

export const deleteTenant = async (req, res) => {
  const { id } = req.params;

  if (!validator.isUUID(id)) throw createError(400, 'valid tenant id is required');

  const tenantCheck = await pool.query(`SELECT id, bed_id FROM tenants WHERE id = $1`, [id]);
  if (!tenantCheck.rows.length) throw createError(404, `Tenant with id '${id}' not found`);

  const { bed_id } = tenantCheck.rows[0];
  if (bed_id) {
    throw createError(
      409,
      `Cannot delete tenant — they are currently assigned to a bed. Unassign the tenant first via POST /api/tenants/unassign`
    );
  }

  await pool.query(`DELETE FROM tenants WHERE id = $1`, [id]);

  res.json({ success: true, message: 'Tenant deleted successfully' });
};

export const assignTenant = async (req, res) => {
  const { tenant_id, bed_id } = req.body;

  if (!tenant_id || !validator.isUUID(tenant_id)) throw createError(400, 'valid tenant_id is required');
  if (!bed_id || !validator.isUUID(bed_id)) throw createError(400, 'valid bed_id is required');

  const tenantResult = await pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]);
  if (!tenantResult.rows.length) throw createError(404, `Tenant with id '${tenant_id}' not found`);

  const tenant = tenantResult.rows[0];

  const bedResult = await pool.query(`SELECT * FROM beds WHERE id = $1`, [bed_id]);
  if (!bedResult.rows.length) throw createError(404, `Bed with id '${bed_id}' not found`);

  const bed = bedResult.rows[0];

  if (bed.status === 'Occupied') {
    throw createError(409, `Bed is already Occupied by another tenant`);
  }

  if (bed.status === 'Under Maintenance') {
    throw createError(409, `Bed is Under Maintenance and cannot be assigned`);
  }

  if (tenant.bed_id === bed_id) {
    throw createError(409, `Tenant is already assigned to this bed`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const oldBedId = tenant.bed_id;

    if (oldBedId) {
      await client.query(`UPDATE beds SET status = 'Available' WHERE id = $1`, [oldBedId]);
    }

    await client.query(`UPDATE beds SET status = 'Occupied' WHERE id = $1`, [bed_id]);
    await client.query(`UPDATE tenants SET bed_id = $1 WHERE id = $2`, [bed_id, tenant_id]);

    await client.query('COMMIT');

    const { rows } = await pool.query(
      `SELECT
         t.*,
         b.status   AS bed_status,
         r.id       AS room_id,
         r.name     AS room_name,
         f.id       AS flat_id,
         f.name     AS flat_name
       FROM tenants t
       LEFT JOIN beds  b ON b.id = t.bed_id
       LEFT JOIN rooms r ON r.id = b.room_id
       LEFT JOIN flats f ON f.id = r.flat_id
       WHERE t.id = $1`,
      [tenant_id]
    );

    res.json({
      success: true,
      message: oldBedId
        ? `Tenant reassigned from previous bed to new bed`
        : `Tenant successfully assigned to bed`,
      data: rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

export const unassignTenant = async (req, res) => {
  const { tenant_id } = req.body;

  if (!tenant_id || !validator.isUUID(tenant_id)) throw createError(400, 'valid tenant_id is required');

  const tenantResult = await pool.query(`SELECT * FROM tenants WHERE id = $1`, [tenant_id]);
  if (!tenantResult.rows.length) throw createError(404, `Tenant with id '${tenant_id}' not found`);

  const tenant = tenantResult.rows[0];

  if (!tenant.bed_id) {
    throw createError(409, `Tenant is not currently assigned to any bed`);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`UPDATE beds SET status = 'Available' WHERE id = $1`, [tenant.bed_id]);
    await client.query(`UPDATE tenants SET bed_id = NULL WHERE id = $1`, [tenant_id]);

    await client.query('COMMIT');

    res.json({ success: true, message: 'Tenant unassigned and bed set to Available' });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};