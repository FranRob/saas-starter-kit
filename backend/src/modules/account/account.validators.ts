import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});
