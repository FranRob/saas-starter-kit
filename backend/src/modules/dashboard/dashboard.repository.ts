import { prisma } from "../../lib/prisma.js";

export async function countContacts(tenantId: string) {
  return prisma.contact.count({ where: { tenantId } });
}

export async function countProducts(tenantId: string) {
  return prisma.product.count({ where: { tenantId } });
}

export async function countUnreadNotifications(tenantId: string) {
  return prisma.notification.count({ where: { tenantId, read: false } });
}

export async function countActiveUsers(tenantId: string) {
  return prisma.user.count({ where: { tenantId, isActive: true } });
}

export async function findRecentContacts(tenantId: string, limit = 5) {
  return prisma.contact.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { id: true, name: true, email: true, phone: true, createdAt: true },
  });
}
