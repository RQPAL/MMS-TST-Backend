import { pool } from "../db/pool.js";

export const logAudit = async ({
  user_id = null,
  action,
  entity,
  entity_id = null,
  payload = null,
  req
}) => {
  try {
    await pool.query(
      `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity,
        entity_id,
        payload,
        ip_address,
        user_agent
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        user_id,
        action,
        entity,
        entity_id,
        payload,
        req?.ip ?? null,
        req?.headers["user-agent"] ?? null
      ]
    );
  } catch (err) {
    // ❗ audit tidak boleh mematikan request
    console.error("AUDIT LOG ERROR:", err.message);
  }
};
