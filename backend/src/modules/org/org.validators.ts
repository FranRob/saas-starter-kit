import { z } from "zod";

export const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logoUrl: z.string().url().optional().nullable(),
});
