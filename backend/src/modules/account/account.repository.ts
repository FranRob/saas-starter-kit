import { prisma } from "../../lib/prisma.js";

export async function findUser(userId: string, tenantId: string) {
  return prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      twoFactorSecret: { select: { verified: true } },
    },
  });
}

export async function updateUserName(userId: string, tenantId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function findUserWithPassword(userId: string, tenantId: string) {
  return prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, passwordHash: true, tenantId: true },
  });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}
