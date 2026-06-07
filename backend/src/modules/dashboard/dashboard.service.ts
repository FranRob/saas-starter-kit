import { prisma } from "../../lib/prisma.js";

export async function getStats(tenantId: string) {
  const [contacts, products, notifications_unread, users] = await Promise.all([
    prisma.contact.count({ where: { tenantId } }),
    prisma.product.count({ where: { tenantId } }),
    prisma.notification.count({ where: { tenantId, read: false } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
  ]);

  return { contacts, products, notifications_unread, users };
}
