import pool from '../config/db.js';

// Helper function to handle database errors
const handleDBError = (err) => {
  console.error('Database Error:', {
    code: err.code,
    message: err.message,
    stack: err.stack
  });
  const error = new Error(err.message);
  error.statusCode = 500;
  throw error;
};

export const getLostItems = async (c) => {
  try {
    const { page = 1, limit = 10 } = c.req.query();
    const offset = (page - 1) * limit;

    const { rows } = await pool.query(`
      SELECT li.*, ic.category_name, cl.building as location_building
      FROM LOST_ITEM li
      JOIN ITEM_CATEGORY ic ON li.category_id = ic.category_id
      LEFT JOIN CST_LOCATION cl ON li.location_id = cl.location_id
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM LOST_ITEM');
    
    return c.json({
      success: true,
      data: rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (err) {
    handleDBError(err);
  }
};

export const getLostItem = async (c) => {
  try {
    const { id } = c.req.param();
    const { rows } = await pool.query(
      `SELECT * FROM LOST_ITEM WHERE lost_id = $1`,
      [id]
    );

    if (rows.length === 0) {
      throw new Error('Item not found');
    }

    return c.json({ success: true, data: rows[0] });
  } catch (err) {
    handleDBError(err);
  }
};

export const createLostItem = async (c) => {
  try {
    const body = await c.req.json();
    
    const requiredFields = [
      'user_id', 'category_id', 'item_name', 
      'description', 'date_lost'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
      error.custom = true;
      error.statusCode = 400;
      throw error;
    }

    const { rows } = await pool.query(
      `INSERT INTO LOST_ITEM (
        user_id, category_id, item_name, description,
        date_lost, location_id, color, brand, identifying_features
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        body.user_id,
        body.category_id,
        body.item_name,
        body.description,
        body.date_lost,
        body.location_id || null,
        body.color || null,
        body.brand || null,
        body.identifying_features || null
      ]
    );

    return c.json({ success: true, data: rows[0] }, 201);
  } catch (err) {
    handleDBError(err);
  }
};

export const updateLostItem = async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    const { rows } = await pool.query(
      `UPDATE LOST_ITEM SET
        category_id = COALESCE($1, category_id),
        item_name = COALESCE($2, item_name),
        description = COALESCE($3, description),
        date_lost = COALESCE($4, date_lost),
        location_id = COALESCE($5, location_id),
        color = COALESCE($6, color),
        brand = COALESCE($7, brand),
        identifying_features = COALESCE($8, identifying_features),
        status = COALESCE($9, status)
      WHERE lost_id = $10
      RETURNING *`,
      [
        body.category_id,
        body.item_name,
        body.description,
        body.date_lost,
        body.location_id,
        body.color,
        body.brand,
        body.identifying_features,
        body.status,
        id
      ]
    );

    if (rows.length === 0) {
      throw new Error('Item not found');
    }

    return c.json({ success: true, data: rows[0] });
  } catch (err) {
    handleDBError(err);
  }
};

export const deleteLostItem = async (c) => {
  try {
    const { id } = c.req.param();
    const { rowCount } = await pool.query(
      'DELETE FROM LOST_ITEM WHERE lost_id = $1',
      [id]
    );

    if (rowCount === 0) {
      throw new Error('Item not found');
    }

    return c.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    handleDBError(err);
  }
};