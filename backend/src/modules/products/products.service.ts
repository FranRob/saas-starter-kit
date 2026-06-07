import { NotFoundError } from "../../lib/errors.js";
import * as repo from "./products.repository.js";

export async function listProducts(tenantId: string) {
  return repo.findAll(tenantId);
}

export async function getProduct(id: string, tenantId: string) {
  const product = await repo.findById(id, tenantId);
  if (!product) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");
  return product;
}

export async function createProduct(
  tenantId: string,
  data: { name: string; description?: string | null; price: number; stock: number },
) {
  return repo.create(tenantId, data);
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

export async function deleteProduct(id: string, tenantId: string) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("PRODUCT_NOT_FOUND", "Product not found");
  await repo.remove(id, tenantId);
}
