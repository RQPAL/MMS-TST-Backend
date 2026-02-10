import { pool } from "../../db/pool.js";

export const getOverdueFollowUps = async () => {
  const result = await pool.query(`
    SELECT
      o.id AS offer_id,
      c.company_name,
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
  `);

  return result.rows;
};