import { NotFoundError } from "../../lib/errors.js";
import * as repo from "./contacts.repository.js";
import { logAudit } from "../../lib/audit.js";

export async function listContacts(
  tenantId: string,
  params: { search?: string; page?: number; pageSize?: number } = {},
) {
  return repo.findAll(tenantId, params);
}

export async function getContact(id: string, tenantId: string) {
  const contact = await repo.findById(id, tenantId);
  if (!contact) throw new NotFoundError("CONTACT_NOT_FOUND", "Contact not found");
  return contact;
}

export async function createContact(
  tenantId: string,
  data: { name: string; email?: string | null; phone?: string | null; notes?: string | null },
  userId?: string,
) {
  const contact = await repo.create(tenantId, data);
  await logAudit({ action: "CREATE", entity: "Contact", entityId: contact.id, userId, tenantId });
  return contact;
}

export async function updateContact(
  id: string,
  tenantId: string,
  data: { name?: string; email?: string | null; phone?: string | null; notes?: string | null },
) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("CONTACT_NOT_FOUND", "Contact not found");
  return repo.update(id, tenantId, data);
}

export async function deleteContact(id: string, tenantId: string, userId?: string) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("CONTACT_NOT_FOUND", "Contact not found");
  await repo.remove(id, tenantId);
  await logAudit({ action: "DELETE", entity: "Contact", entityId: id, userId, tenantId });
}
