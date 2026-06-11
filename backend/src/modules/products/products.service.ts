import { NotFoundError } from "../../lib/errors.js";
import * as repo from "./products.repository.js";
import { logAudit } from "../../lib/audit.js";

export async function listProducts(
  tenantId: string,
  params: { search?: string; page?: number; pageSize?: number } = {},
) {
  return repo.findAll(tenantId, params);
}

export async function getProduct(id: string, tenantId: string) {
  const product = await repo.findById(id, tenantId);
  if (!product) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");
  return product;
}

export async function createProduct(
  tenantId: string,
  data: { name: string; description?: string | null; price: number; stock: number },
  userId?: string,
) {
  const product = await repo.create(tenantId, data);
  await logAudit({ action: "CREATE", entity: "Product", entityId: product.id, userId, tenantId });
  return product;
}

export async function updateProduct(
  id: string,
  tenantId: string,
  data: { name?: string; description?: string | null; price?: number; stock?: number },
) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");
  return repo.update(id, tenantId, data);
}

export async function deleteProduct(id: string, tenantId: string, userId?: string) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");
  await repo.remove(id, tenantId);
  await logAudit({ action: "DELETE", entity: "Product", entityId: id, userId, tenantId });
}
