import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { AppError, ConflictError, NotFoundError, ForbiddenError } from '../../lib/errors.js'
import { env } from '../../lib/env.js'
import { sendEmail } from '../../lib/mailer.js'
import { logAudit } from '../../lib/audit.js'
import * as repo from './team.repository.js'
import type { UserRole } from '@prisma/client'

export async function getMembers(tenantId: string) {
  return repo.findMembers(tenantId)
}

export async function inviteUser(data: {
  email: string
  role: UserRole
  tenantId: string
  inviterName: string
  inviterId: string
}) {
  const existingUser = await repo.findActiveUserInTenant(data.tenantId, data.email)
  if (existingUser) {
    throw new ConflictError('USER_ALREADY_MEMBER', 'User is already a member of this team')
  }

  const existingInvite = await repo.findPendingInvitationByEmail(data.tenantId, data.email)
  if (existingInvite) {
    throw new ConflictError('INVITATION_PENDING', 'An invitation for this email is already pending')
  }

  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

  const invitation = await repo.createInvitation({
    email: data.email,
    role: data.role,
    tokenHash,
    expiresAt,
    tenantId: data.tenantId,
  })

  const inviteUrl = `${env.FRONTEND_URL}/accept-invite?token=${token}`

  await sendEmail({
    to: data.email,
    subject: `${data.inviterName} invited you to join their team`,
    html: `
      <p>${data.inviterName} has invited you to join their team.</p>
      <p><a href="${inviteUrl}">Accept invitation</a></p>
      <p>This link expires in 48 hours.</p>
    `,
  })

  await logAudit({
    action: 'INVITE',
    entity: 'Invitation',
    entityId: invitation.id,
    userId: data.inviterId,
    tenantId: data.tenantId,
  })

  return { message: 'Invitation sent' }
}

export async function getInviteDetails(token: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  const invitation = await repo.findInvitationByToken(tokenHash)

  if (!invitation) {
    throw new NotFoundError('INVITATION_NOT_FOUND', 'Invitation not found')
  }

  if (invitation.acceptedAt) {
    throw new AppError(400, 'INVITATION_ALREADY_ACCEPTED', 'Invitation has already been accepted')
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError(400, 'INVITATION_EXPIRED', 'Invitation has expired')
  }

  return {
    email: invitation.email,
    role: invitation.role,
    tenantName: invitation.tenant.name,
  }
}

export async function acceptInvite(data: { token: string; name: string; password: string }) {
  const tokenHash = crypto.createHash('sha256').update(data.token).digest('hex')
  const invitation = await repo.findInvitationByToken(tokenHash)

  if (!invitation) {
    throw new NotFoundError('INVITATION_NOT_FOUND', 'Invitation not found')
  }

  if (invitation.acceptedAt) {
    throw new AppError(400, 'INVITATION_ALREADY_ACCEPTED', 'Invitation has already been accepted')
  }

  if (invitation.expiresAt < new Date()) {
    throw new AppError(400, 'INVITATION_EXPIRED', 'Invitation has expired')
  }

  const existingUser = await repo.findUserByEmail(invitation.email)
  if (existingUser) {
    throw new ConflictError('EMAIL_IN_USE', 'An account with this email already exists')
  }

  const passwordHash = await bcrypt.hash(data.password, 10)

  await repo.createUser({
    email: invitation.email,
    name: data.name,
    passwordHash,
    role: invitation.role,
    tenantId: invitation.tenantId,
    emailVerified: true,
  })

  await repo.acceptInvitation(invitation.id, new Date())

  return { message: 'Account created' }
}

export async function changeRole(
  tenantId: string,
  targetUserId: string,
  newRole: UserRole,
  requesterId: string,
) {
  if (targetUserId === requesterId) {
    throw new ForbiddenError('CANNOT_CHANGE_OWN_ROLE', 'You cannot change your own role')
  }

  const target = await repo.findMember(tenantId, targetUserId)
  if (!target) {
    throw new NotFoundError('MEMBER_NOT_FOUND', 'Member not found')
  }

  if (target.role === 'OWNER') {
    throw new ForbiddenError('CANNOT_CHANGE_OWNER_ROLE', 'Cannot change the owner role')
  }

  return repo.updateRole(tenantId, targetUserId, newRole)
}

export async function removeMember(
  tenantId: string,
  targetUserId: string,
  requesterId: string,
) {
  if (targetUserId === requesterId) {
    throw new ForbiddenError('CANNOT_REMOVE_SELF', 'You cannot remove yourself')
  }

  const target = await repo.findMember(tenantId, targetUserId)
  if (!target) {
    throw new NotFoundError('MEMBER_NOT_FOUND', 'Member not found')
  }

  if (target.role === 'OWNER') {
    throw new ForbiddenError('CANNOT_REMOVE_OWNER', 'Cannot remove the owner')
  }

  await repo.removeMember(tenantId, targetUserId)

  await logAudit({
    action: 'REMOVE_MEMBER',
    entity: 'User',
    entityId: targetUserId,
    userId: requesterId,
    tenantId,
  })
}

export async function getPendingInvitations(tenantId: string) {
  return repo.findPendingInvitations(tenantId)
}
