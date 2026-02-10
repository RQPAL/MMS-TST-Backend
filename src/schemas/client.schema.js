import { z } from "zod";

export const createClientSchema = z.object({
  body: z.object({
    id_penawaran_custom: z.string().min(1, "id_penawaran_custom wajib diisi"),
    company_name: z.string().min(1, "company_name wajib diisi"),
    industry_type: z.string().optional(),
    province: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    village: z.string().optional(),
    street: z.string().optional(),
    pic_name: z.string().optional(),
    phone: z.string().optional(),
    social_media: z.any().optional()
  })
});
