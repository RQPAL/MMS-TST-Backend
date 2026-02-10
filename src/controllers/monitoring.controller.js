import { pool } from "../db/pool.js";
import { successResponse } from "../utils/response.js";

export const getSilentOffers = async (req, res, next) => {
  try {
    const { days = 3 } = req.query;

    const result = await pool.query(`
      SELECT
        o.id,
        c.company_name,
        o.offer_date,
        o.channel,
        o.created_at
      FROM offers o
      JOIN clients c ON c.id = o.client_id
      WHERE
        o.status = 'OPEN'
        AND o.current_fu = 0
        AND o.offer_date <= CURRENT_DATE - INTERVAL '${Number(days)} days'
      ORDER BY o.offer_date ASC
    `);

    return successResponse(
      res,
      "Silent offers berhasil diambil",
      result.rows
    );
  } catch (error) {
    next(error);
  }
};

export const getStalledOffers = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id AS offer_id,
        c.company_name,
        o.current_fu,
        fu.next_follow_up_at
      FROM offers o
      JOIN clients c ON c.id = o.client_id
      JOIN LATERAL (
        SELECT *
        FROM follow_up_logs
        WHERE offer_id = o.id
        ORDER BY fu_number DESC
        LIMIT 1
      ) fu ON true
      WHERE
        o.status = 'OPEN'
        AND fu.next_follow_up_at IS NOT NULL
        AND fu.next_follow_up_at < CURRENT_DATE
      ORDER BY fu.next_follow_up_at ASC
    `);

    return successResponse(
      res,
      "Stalled offers berhasil diambil",
      result.rows
    );
  } catch (error) {
    next(error);
  }
};

export const getDailyActivity = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE(f.created_at) AS activity_date,
        COUNT(*) AS total_fu,
        COUNT(*) FILTER (WHERE f.is_success = true) AS success_contact
      FROM follow_up_logs f
      WHERE DATE(f.created_at) = CURRENT_DATE
      GROUP BY DATE(f.created_at)
    `);

    return successResponse(
      res,
      "Aktivitas marketing hari ini",
      result.rows[0] ?? {
        activity_date: new Date(),
        total_fu: 0,
        success_contact: 0
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getPipelineHealth = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'OPEN') AS open,
        COUNT(*) FILTER (WHERE status = 'CLOSED') AS closed,
        COUNT(*) FILTER (WHERE status = 'LOST') AS lost
      FROM offers
    `);

    return successResponse(
      res,
      "Pipeline health berhasil diambil",
      result.rows[0]
    );
  } catch (error) {
    next(error);
  }
};