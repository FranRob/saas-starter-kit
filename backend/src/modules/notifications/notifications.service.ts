import { NotFoundError } from "../../lib/errors.js";
import * as repo from "./notifications.repository.js";

export async function listNotifications(tenantId: string) {
  return repo.findAll(tenantId);
}

export async function markRead(id: string, tenantId: string) {
  const existing = await repo.findById(id, tenantId);
  if (!existing) throw new NotFoundError("NOTIFICATION_NOT_FOUND", "Notification not found");
  return repo.markAsRead(id, tenantId);
}

export async function markAllRead(tenantId: string) {
  return repo.markAllAsRead(tenantId);
}
