import { prisma } from '../../lib/prisma.js'
import type { UserRole } from '@prisma/client'

export async function findMembers(tenantId: string) {
  return prisma.user.findMany({
    where: { tenantId },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function findMember(tenantId: string, userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
  })
}

export async function updateRole(tenantId: string, userId: string, role: UserRole) {
  return prisma.user.update({ where: { id: userId }, data: { role } })
}

export async function removeMember(tenantId: string, userId: string) {
  return prisma.user.delete({ where: { id: userId } })
}

export async function createInvitation(data: {
  email: string
  role: UserRole
  tokenHash: string
  expiresAt: Date
  tenantId: string
}) {
  return prisma.invitation.create({ data })
}

export async function findInvitationByToken(tokenHash: string) {
  return prisma.invitation.findUnique({
    where: { tokenHash },
    include: { tenant: true },
  })
}

export async function acceptInvitation(invitationId: string, acceptedAt: Date) {
  return prisma.invitation.update({ where: { id: invitationId }, data: { acceptedAt } })
}

export async function findPendingInvitations(tenantId: string) {
  return prisma.invitation.findMany({
    where: {
      tenantId,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findActiveUserInTenant(tenantId: string, email: string) {
  return prisma.user.findFirst({ where: { tenantId, email } })
}

export async function findPendingInvitationByEmail(tenantId: string, email: string) {
  return prisma.invitation.findFirst({
    where: {
      tenantId,
      email,
      acceptedAt: null,
      expiresAt: { gt: new Date() },
    },
  })
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(data: {
  email: string
  name: string
  passwordHash: string
  role: UserRole
  tenantId: string
  emailVerified: boolean
}) {
  return prisma.user.create({ data })
}
