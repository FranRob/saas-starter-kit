import { prisma } from "../../lib/prisma.js";

export async function findAll(
  tenantId: string,
  { search, page = 1, pageSize = 10 }: { search?: string; page?: number; pageSize?: number } = {},
) {
  const where = {
    tenantId,
    ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);
  return { products, total };
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
