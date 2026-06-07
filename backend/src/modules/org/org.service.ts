import { NotFoundError } from "../../lib/errors.js";
import * as repo from "./org.repository.js";

export async function getOrg(tenantId: string) {
  const tenant = await repo.findTenant(tenantId);
  if (!tenant) throw new NotFoundError("TENANT_NOT_FOUND", "Organization not found");
  return tenant;
}

export async function updateOrg(
  tenantId: string,
  data: { name?: string; logoUrl?: string | null },
) {
  const tenant = await repo.findTenant(tenantId);
  if (!tenant) throw new NotFoundError("TENANT_NOT_FOUND", "Organization not found");
  return repo.updateTenant(tenantId, data);
}
