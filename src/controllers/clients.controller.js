import { pool } from "../db/pool.js";
import { validate as isUUID } from "uuid";

// deklarasi membuat data client baru
export const createClient = async (req, res) => {
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

    // 1️⃣ validasi minimal
    if (!id_penawaran_custom || !company_name) {
      return res.status(400).json({
        message: "id_penawaran_custom dan company_name wajib diisi"
      });
    }

    // 2️⃣ insert ke database
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
        industry_type,
        province,
        city,
        district,
        village,
        street,
        pic_name,
        phone,
        social_media
      ]
    );

    // 3️⃣ response sukses
    res.status(201).json({
      message: "Client berhasil dibuat",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    // 4️⃣ handle duplicate id_penawaran_custom
    if (error.code === "23505") {
      return res.status(409).json({
        message: "ID Penawaran sudah digunakan"
      });
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

//deklarasi ambil data client dari database
export const getClients = async (req, res) => {
  try {
    const {
      search,
      province,
      city,
      industry,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    const conditions = [];
    const values = [];

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

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    // query data
    const dataQuery = `
      SELECT *
      FROM clients
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    // query total (untuk pagination)
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM clients
      ${whereClause}
    `;

    const dataValues = [...values, Number(limit), offset];
    const countValues = [...values];

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, dataValues),
      pool.query(countQuery, countValues),
    ]);

    res.json({
      page: Number(page),
      limit: Number(limit),
      total: countResult.rows[0].total,
      data: dataResult.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//deklarasi merubah data client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isUUID(id)) {
      return res.status(400).json({
        message: "Invalid client id"
      });
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

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({
        message: "Tidak ada field yang diupdate"
      });
    }

    values.push(id);

    const query = `
      UPDATE clients
      SET ${updates.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Client tidak ditemukan"
      });
    }

    res.json({
      message: "Client berhasil diupdate",
      data: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

