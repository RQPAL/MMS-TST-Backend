import { pool } from "../db/pool.js";
import { validate as isUUID } from "uuid";
import { successResponse, errorResponse } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

/**
 * CREATE OFFER (STEP-0)
 * POST /offers
 */
export const createOffer = async (req, res, next) => {
  try {
    const { client_id, offer_date, channel } = req.body;

    // 1️⃣ VALIDASI INPUT WAJIB
    if (!client_id || !offer_date || !channel) {
      return errorResponse(
        res,
        "client_id, offer_date, dan channel wajib diisi",
        400
      );
    }

    // 2️⃣ VALIDASI UUID
    if (!isUUID(client_id)) {
      return errorResponse(res, "Invalid client_id", 400);
    }

    // 3️⃣ PASTIKAN CLIENT ADA
    const clientCheck = await pool.query(
      "SELECT id FROM clients WHERE id = $1 AND deleted_at IS NULL",
      [client_id]
    );

    if (clientCheck.rowCount === 0) {
      return errorResponse(res, "Client tidak ditemukan", 404);
    }

    // 4️⃣ CEK OFFER OPEN GANDA (BUSINESS RULE)
    const openOfferCheck = await pool.query(
      "SELECT id FROM offers WHERE client_id = $1 AND status = 'OPEN'",
      [client_id]
    );

    if (openOfferCheck.rowCount > 0) {
      return errorResponse(
        res,
        "Client masih memiliki penawaran OPEN",
        409
      );
    }

    // 5️⃣ INSERT OFFER (STEP-0 TRIGGER)
    const result = await pool.query(
      `
      INSERT INTO offers (
        client_id,
        offer_date,
        channel,
        status
      )
      VALUES ($1, $2, $3, 'OPEN')
      RETURNING *
      `,
      [client_id, offer_date, channel]
    );
    
    const createdOffer = result.rows[0];
    // AUDIT
    await logAudit({
      user_id: req.user.id,
      action: "CREATE",
      entity: "offers",
      entity_id: result.rows[0].id,
      payload: result.rows[0],
      req
    });

    // 6️⃣ RESPONSE SUKSES
    return successResponse(
      res,
      "Penawaran berhasil dibuat",
      {
        id: result.rows[0].id,
        status: result.rows[0].status,
        current_fu: result.rows[0].current_fu
      },
      201
    );

  } catch (error) {
    next(error);
  }
};

/**
 * GET OFFERS
 * GET /offers
 */
export const getOffers = async (req, res, next) => {
  try {
    const {
      status,
      channel,
      client_id,
      date_from,
      date_to,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["o.deleted_at IS NULL"];
    const values = [];

    //Filter status
    if (status) {
      const allowedStatus = ["OPEN", "CLOSED", "LOST"];
      if (!allowedStatus.includes(status)) {
        return errorResponse(res, "Invalid status filter", 400);
      }
      values.push(status);
      conditions.push(`o.status = $${values.length}`);
    }

    //Filter Channel
    if (channel) {
      values.push(channel);
      conditions.push(`o.channel = $${values.length}`);
    }

    //Filter client
    if (client_id) {
      if (!isUUID(client_id)) {
        return errorResponse(res, "Invalid client_id", 400);
      }
      values.push(client_id);
      conditions.push(`o.client_id = $${values.length}`);
    }

    if (date_from) {
      values.push(date_from);
      conditions.push(`o.offer_date >= $${values.length}`);
    }

    if (date_to) {
      values.push(date_to);
      conditions.push(`o.offer_date <= $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const dataQuery = `
      SELECT
        o.id,
        o.client_id,
        c.company_name,
        o.offer_date,
        o.channel,
        o.status,
        o.current_fu,
        o.created_at
      FROM offers o
      JOIN clients c ON c.id = o.client_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM offers o
      ${whereClause}
    `;

    const dataValues = [...values, limitNum, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values),
    ]);

    return successResponse(
      res,
      "Data offers berhasil diambil",
      {
        page: pageNum,
        limit: limitNum,
        total: countResult.rows[0].total,
        items: dataResult.rows
      }
    );

  } catch (error) {
    next(error);
  }
};
