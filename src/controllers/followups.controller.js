import { pool } from "../db/pool.js";
import { validate as isUUID } from "uuid";
import { successResponse, errorResponse } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

/**
 * CREATE FOLLOW UP
 * POST /follow-ups
 */
export const createFollowUp = async (req, res, next) => {
  try {
    const {
      offer_id,
      contact_date,
      channel,
      is_success,
      result,
      notes,
      next_follow_up_at
    } = req.body;

    // 1️⃣ VALIDASI INPUT WAJIB
    if (!offer_id || !contact_date || !channel || !result) {
      return errorResponse(
        res,
        "offer_id, contact_date, channel, dan result wajib diisi",
        400
      );
    }

    // 2️⃣ VALIDASI UUID
    if (!isUUID(offer_id)) {
      return errorResponse(res, "Invalid offer_id", 400);
    }

    // 3️⃣ VALIDASI ENUM RESULT
    const allowedResults = ["CONTINUE", "CLOSED", "LOST"];
    if (!allowedResults.includes(result)) {
      return errorResponse(res, "Invalid follow up result", 400);
    }

    // 4️⃣ AMBIL OFFER
    const offerRes = await pool.query(
      `
      SELECT id, status, current_fu
      FROM offers
      WHERE id = $1
      `,
      [offer_id]
    );

    if (offerRes.rowCount === 0) {
      return errorResponse(res, "Offer tidak ditemukan", 404);
    }

    const offer = offerRes.rows[0];

    // 5️⃣ OFFER HARUS OPEN
    if (offer.status !== "OPEN") {
      return errorResponse(
        res,
        `Offer sudah ${offer.status}`,
        409
      );
    }

    // 6️⃣ MAX 5 FOLLOW UP (BUSINESS RULE)
    if (offer.current_fu >= 5) {
      return errorResponse(
        res,
        "Follow up sudah mencapai batas maksimum",
        409
      );
    }

    // 7️⃣ HITUNG FU NUMBER (MUTLAK DI BACKEND)
    const fu_number = offer.current_fu + 1;

    // 8️⃣ INSERT FOLLOW UP LOG (IMMUTABLE HISTORY)
    await pool.query(
      `
      INSERT INTO follow_up_logs (
        offer_id,
        fu_number,
        contact_date,
        channel,
        is_success,
        result,
        notes,
        next_follow_up_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `,
      [
        offer_id,
        fu_number,
        contact_date,
        channel,
        is_success ?? false,
        result,
        notes ?? null,
        next_follow_up_at ?? null
      ]
    );

    // 9️⃣ UPDATE OFFER SNAPSHOT
    const newStatus =
      result === "CLOSED" || result === "LOST"
        ? result
        : "OPEN";

    await pool.query(
      `
      UPDATE offers
      SET
        current_fu = $1,
        status = $2,
        updated_at = NOW()
      WHERE id = $3
      `,
      [fu_number, newStatus, offer_id]
    );

    // ✅ AUDIT (E5 — WAJIB DI SINI)
    await logAudit({
      user_id: req.user.id,
      action: "CREATE",
      entity: "follow_up_logs",
      entity_id: offer_id,
      payload: {
      fu_number,
      channel,
      result
      },
      req
    });
    // 🔟 RESPONSE SUKSES
    return successResponse(
      res,
      "Follow up berhasil dicatat",
      {
        fu_number,
        offer_status: newStatus
      },
      201
    );

  } catch (error) {
    next(error);
  }
};

/**
 * GET FOLLOW UPS BY OFFER
 * GET /offers/:id/follow-ups
 */
export const getFollowUpsByOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    if (!isUUID(id)) {
      return errorResponse(res, "Invalid offer_id", 400);
    }

    const dataQuery = `
      SELECT
        fu_number,
        contact_date,
        channel,
        is_success,
        result,
        notes,
        next_follow_up_at,
        created_at
      FROM follow_up_logs
      WHERE offer_id = $1
      ORDER BY fu_number ASC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM follow_up_logs
      WHERE offer_id = $1
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [id, limitNum, offset]),
      pool.query(countQuery, [id]),
    ]);

    return successResponse(
      res,
      "Riwayat follow up berhasil diambil",
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


/**
 * GET OVERDUE FOLLOW UPS
 * GET /follow-ups/overdue
 */

export const getOverdueFollowUps = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        o.id AS offer_id,
        c.company_name,
        o.current_fu,
        fu.fu_number,
        fu.channel,
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
      "Data follow up overdue berhasil diambil",
      result.rows,
      200
    );

  } catch (error) {
    next(error);
  }
};
