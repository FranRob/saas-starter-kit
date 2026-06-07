import { prisma } from "../../lib/prisma.js";

export async function findAll(tenantId: string) {
  return prisma.contact.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string, tenantId: string) {
  return prisma.contact.findFirst({ where: { id, tenantId } });
}

export async function create(
  tenantId: string,
  data: { name: string; email?: string | null; phone?: string | null; notes?: string | null },
) {
  return prisma.contact.create({ data: { ...data, tenantId } });
}

export async function update(
  id: string,
  tenantId: string,
  data: { name?: string; email?: string | null; phone?: string | null; notes?: string | null },
) {
  return prisma.contact.update({ where: { id }, data });
}

export async function remove(id: string, tenantId: string) {
  return prisma.contact.delete({ where: { id } });
}

export async function count(tenantId: string) {
  return prisma.contact.count({ where: { tenantId } });
}
