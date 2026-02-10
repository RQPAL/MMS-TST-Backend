import { pool } from "../../db/pool.js";

export const getSilentOffers = async (days = 3) => {
  const result = await pool.query(`
    SELECT
      o.id,
      c.company_name,
      o.offer_date,
      o.channel
    FROM offers o
    JOIN clients c ON c.id = o.client_id
    WHERE
      o.status = 'OPEN'
      AND o.current_fu = 0
      AND o.offer_date <= CURRENT_DATE - INTERVAL '${Number(days)} days'
  `);

  return result.rows;
};