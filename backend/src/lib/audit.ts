import { prisma } from './prisma.js'

export async function logAudit(data: {
  action: string
  entity: string
  entityId?: string
  userId?: string
  tenantId: string
}) {
  await prisma.auditLog.create({ data }).catch(() => {})
}
