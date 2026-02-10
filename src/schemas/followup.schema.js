import { z } from "zod";

export const createFollowUpSchema = z.object({
  body: z.object({
    offer_id: z.string().uuid("offer_id harus UUID"),
    contact_date: z.string(),
    channel: z.string().min(1),
    is_success: z.boolean().optional(),
    result: z.enum(["CONTINUE", "CLOSED", "LOST"]),
    notes: z.string().optional(),
    next_follow_up_at: z.string().optional()
  })
});
