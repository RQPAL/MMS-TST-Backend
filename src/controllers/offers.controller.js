import { pool } from "../db/pool.js";

export const createOffer = async (req, res) => {
  try {
    // 🔎 DEBUG (boleh ada dulu)
    console.log("🔥 APP.JS LOADED FROM:", import.meta.url);

    const { client_id, offer_date, channel, notes } = req.body;

    // 1️⃣ Validasi input wajib
    if (!client_id || !offer_date || !channel) {
      return res.status(400).json({
        message: "client_id, offer_date, dan channel wajib diisi"
      });
    }

    // 2️⃣ Pastikan client ADA
    const clientCheck = await pool.query(
      "SELECT id FROM clients WHERE id = $1",
      [client_id]
    );

    if (clientCheck.rowCount === 0) {
      return res.status(404).json({
        message: "Client tidak ditemukan"
      });
    }

    // 3️⃣ Cek apakah masih ada offer OPEN
    const openOfferCheck = await pool.query(
      "SELECT id FROM offers WHERE client_id = $1 AND status = 'OPEN'",
      [client_id]
    );

    if (openOfferCheck.rowCount > 0) {
      return res.status(409).json({
        message: "Client masih memiliki penawaran OPEN"
      });
    }

    // 4️⃣ Insert offer baru
    const insertResult = await pool.query(
      `
      INSERT INTO offers (
        client_id,
        offer_date,
        channel,
        notes,
        status
      )
      VALUES ($1, $2, $3, $4, 'OPEN')
      RETURNING *
      `,
      [
        client_id,
        offer_date,
        channel,
        notes || null
      ]
    );

    // 5️⃣ Response sukses
    return res.status(201).json({
      message: "Penawaran berhasil dibuat",
      data: insertResult.rows[0]
    });

  } catch (error) {
    console.error("CREATE OFFER ERROR:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
