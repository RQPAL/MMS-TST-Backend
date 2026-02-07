import { pool } from "../db/pool.js";

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
