import { prisma } from "../../lib/prisma.js";

export async function findAll(tenantId: string) {
  return prisma.product.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: string, tenantId: string) {
  return prisma.product.findFirst({ where: { id, tenantId } });
}

export async function create(
  tenantId: string,
  data: { name: string; description?: string | null; price: number; stock: number },
) {
  return prisma.product.create({ data: { ...data, tenantId } });
}

export async function update(
  id: string,
  tenantId: string,
  data: { name?: string; description?: string | null; price?: number; stock?: number },
) {
  return prisma.product.update({ where: { id }, data });
}

export async function remove(id: string, tenantId: string) {
  return prisma.product.delete({ where: { id } });
}

export async function count(tenantId: string) {
  return prisma.product.count({ where: { tenantId } });
}
