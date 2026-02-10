import { pool } from "../db/pool.js";
import { successResponse } from "../utils/response.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const {
      entity,
      action,
      user_id,
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const values = [];

    if (entity) {
      values.push(entity);
      conditions.push(`entity = $${values.length}`);
    }

    if (action) {
      values.push(action);
      conditions.push(`action = $${values.length}`);
    }

    if (user_id) {
      values.push(user_id);
      conditions.push(`user_id = $${values.length}`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const dataQuery = `
      SELECT *
      FROM audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM audit_logs
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...values, limitNum, offset]),
      pool.query(countQuery, values)
    ]);

    return successResponse(res, "Audit logs", {
      page: pageNum,
      limit: limitNum,
      total: countResult.rows[0].total,
      items: dataResult.rows
    });

  } catch (error) {
    next(error);
  }
};
