import bcrypt from "bcryptjs";
import { NotFoundError, AppError } from "../../lib/errors.js";
import * as repo from "./account.repository.js";

export async function getProfile(userId: string, tenantId: string) {
  const user = await repo.findUser(userId, tenantId);
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    twoFaEnabled: user.twoFactorSecret?.verified ?? false,
    createdAt: user.createdAt,
  };
}

export async function updateProfile(userId: string, tenantId: string, name: string) {
  const user = await repo.findUser(userId, tenantId);
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
  return repo.updateUserName(userId, tenantId, name);
}

export async function changePassword(
  userId: string,
  tenantId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await repo.findUserWithPassword(userId, tenantId);
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError(400, "INVALID_PASSWORD", "Current password is incorrect");

  const hash = await bcrypt.hash(newPassword, 12);
  await repo.updateUserPassword(userId, hash);
}
