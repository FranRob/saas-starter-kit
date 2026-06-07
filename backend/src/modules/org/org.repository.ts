import { prisma } from "../../lib/prisma.js";

export async function findTenant(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, slug: true, logoUrl: true, createdAt: true, updatedAt: true },
  });
}

export async function updateTenant(
  tenantId: string,
  data: { name?: string; logoUrl?: string | null },
) {
  return prisma.tenant.update({
    where: { id: tenantId },
    data,
    select: { id: true, name: true, slug: true, logoUrl: true, updatedAt: true },
  });
}
