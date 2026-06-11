import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
})

export const acceptInviteSchema = z.object({
  token: z.string(),
  name: z.string().min(2),
  password: z.string().min(8),
})

export const changeRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
})
