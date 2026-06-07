import { prisma } from "../../lib/prisma.js";

export async function findAll(tenantId: string) {
  return prisma.notification.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string, tenantId: string) {
  return prisma.notification.findFirst({ where: { id, tenantId } });
}

export async function markAsRead(id: string, tenantId: string) {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
}

export async function markAllAsRead(tenantId: string) {
  return prisma.notification.updateMany({
    where: { tenantId, read: false },
    data: { read: true },
  });
}

export async function countUnread(tenantId: string) {
  return prisma.notification.count({ where: { tenantId, read: false } });
}
