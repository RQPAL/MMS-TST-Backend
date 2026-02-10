import { z } from "zod";

export const createOfferSchema = z.object({
  body: z.object({
    client_id: z.string().uuid("client_id harus UUID"),
    offer_date: z.string().min(1, "offer_date wajib diisi"),
    channel: z.string().min(1, "channel wajib diisi")
  })
});
