import { pool } from "../db/pool.js";
import { successResponse } from "../utils/response.js";

/**
 * GET SUMMARY ANALYTICS
 */
export const getSummaryAnalytics = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'CLOSED') AS total_closed,
        COUNT(*) FILTER (WHERE status = 'LOST') AS total_lost,
        COUNT(*) FILTER (WHERE status IN ('CLOSED','LOST')) AS total_final,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'CLOSED') * 100.0 /
          NULLIF(COUNT(*) FILTER (WHERE status IN ('CLOSED','LOST')), 0),
          2
        ) AS success_rate
      FROM offers
    `);

    return successResponse(
      res,
      "Summary analytics berhasil diambil",
      result.rows[0],
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET CHANNEL ANALYTICS
 */
export const getChannelAnalytics = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        channel,
        COUNT(*) FILTER (WHERE result = 'CLOSED') AS closed,
        COUNT(*) FILTER (WHERE result = 'LOST') AS lost,
        COUNT(*) AS total_fu,
        ROUND(
          COUNT(*) FILTER (WHERE result = 'CLOSED') * 100.0 /
          NULLIF(COUNT(*), 0),
          2
        ) AS close_rate
      FROM follow_up_logs
      GROUP BY channel
      ORDER BY close_rate DESC
    `);

    return successResponse(
      res,
      "Channel analytics berhasil diambil",
      result.rows,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET FU DISTRIBUTION ANALYTICS
 */
export const getFuDistributionAnalytics = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        fu_number,
        COUNT(*) FILTER (WHERE result = 'CLOSED') AS closed,
        COUNT(*) FILTER (WHERE result = 'LOST') AS lost
      FROM follow_up_logs
      WHERE result IN ('CLOSED','LOST')
      GROUP BY fu_number
      ORDER BY fu_number
    `);

    return successResponse(
      res,
      "FU distribution analytics berhasil diambil",
      result.rows,
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET INDUSTRY ANALYTICS
 */
export const getIndustryAnalytics = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        c.industry_type,
        COUNT(*) FILTER (WHERE o.status = 'CLOSED') AS closed,
        COUNT(*) FILTER (WHERE o.status = 'LOST') AS lost,
        ROUND(
          COUNT(*) FILTER (WHERE o.status = 'CLOSED') * 100.0 /
          NULLIF(COUNT(*) FILTER (WHERE o.status IN ('CLOSED','LOST')), 0),
          2
        ) AS success_rate
      FROM offers o
      JOIN clients c ON c.id = o.client_id
      GROUP BY c.industry_type
      ORDER BY success_rate DESC
    `);

    return successResponse(
      res,
      "Industry analytics berhasil diambil",
      result.rows,
      200
    );
  } catch (error) {
    next(error);
  }
};
