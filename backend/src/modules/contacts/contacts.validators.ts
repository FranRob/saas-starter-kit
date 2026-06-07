import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateContactSchema = createContactSchema.partial();

export const contactIdSchema = z.object({
  id: z.string().uuid(),
});
