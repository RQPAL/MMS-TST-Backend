import { pool } from "../db/pool.js";
import { validate as isUUID } from "uuid";
import { successResponse, errorResponse } from "../utils/response.js";
import { logAudit } from "../utils/audit.js";

/**
 * CREATE CLIENT
 * POST /clients
 */
export const createClient = async (req, res, next) => {
  try {
    const {
      id_penawaran_custom,
      company_name,
      industry_type,
      province,
      city,
      district,
      village,
      street,
      pic_name,
      phone,
      social_media
    } = req.body;

    // 1️⃣ VALIDASI MINIMAL
    if (!id_penawaran_custom || !company_name) {
      return errorResponse(
        res,
        "id_penawaran_custom dan company_name wajib diisi",
        400
      );
    }

    // 2️⃣ INSERT KE DATABASE
    const result = await pool.query(
      `
      INSERT INTO clients (
        id_penawaran_custom,
        company_name,
        industry_type,
        province,
        city,
        district,
        village,
        street,
        pic_name,
        phone,
        social_media
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        id_penawaran_custom,
        company_name,
        industry_type ?? null,
        province ?? null,
        city ?? null,
        district ?? null,
        village ?? null,
        street ?? null,
        pic_name ?? null,
        phone ?? null,
        social_media ?? null
      ]
    );

    const createdClient = result.rows[0];

    // AUDIT (E5)
    await logAudit({
      user_id: req.user.id,
      action: "CREATE",
      entity: "clients",
      entity_id: createdClient.id,
      payload: createdClient,
      req
    });

    // 3️⃣ RESPONSE SUKSES
    return successResponse(
      res,
      "Client berhasil dibuat",
      result.rows[0],
      201
    );

  } catch (error) {
    next(error);
  }
};

/**
 * GET CLIENTS (WITH FILTER & PAGINATION)
 * GET /clients
 */
export const getClients = async (req, res, next) => {
  try {
    const {
      search,
      province,
      city,
      industry,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions = ["deleted_at IS NULL"];
    const values = [];

    // 🔍 FILTERS
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`company_name ILIKE $${values.length}`);
    }

    if (province) {
      values.push(province);
      conditions.push(`province = $${values.length}`);
    }

    if (city) {
      values.push(city);
      conditions.push(`city = $${values.length}`);
    }

    if (industry) {
      values.push(industry);
      conditions.push(`industry_type = $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // QUERY DATA
    const dataQuery = `
      SELECT *
      FROM clients
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    // QUERY TOTAL
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM clients
      ${whereClause}
    `;

    const dataValues = [...values, limitNum, offset];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, values),
    ]);

    // RESPONSE
    return successResponse(
      res,
      "Data clients berhasil diambil",
      {
        page: pageNum,
        limit: limitNum,
        total: countResult.rows[0].total,
        data: dataResult.rows
      }
    );

  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE CLIENT
 * PUT /clients/:id
 */
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1️⃣ VALIDASI UUID
    if (!isUUID(id)) {
      return errorResponse(
        res,
        "Invalid client id",
        400
      );
    }

    const allowedFields = [
      "company_name",
      "industry_type",
      "province",
      "city",
      "district",
      "village",
      "street",
      "pic_name",
      "phone",
      "social_media"
    ];

    const updates = [];
    const values = [];

    // 2️⃣ BUILD DYNAMIC UPDATE
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return errorResponse(
        res,
        "Tidak ada field yang diupdate",
        400
      );
    }

    values.push(id);

    const query = `
      UPDATE clients
      SET ${updates.join(", ")},
          updated_at = NOW()
      WHERE id = $${values.length}
        AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return errorResponse(
        res,
        "Client tidak ditemukan",
        404
      );
    }

    const updatedClient = result.rows[0];

    // AUDIT (E5)
    await logAudit({
      user_id: req.user.id,
      action: "UPDATE",
      entity: "clients",
      entity_id: updatedClient.id,
      payload: {
      updated_fields: req.body
      },
      req
    });

    // 3️⃣ RESPONSE SUKSES
    return successResponse(
      res,
      "Client berhasil diupdate",
      result.rows[0],
      200
    );
    
  } catch (error) {
    next(error);
  }
};
