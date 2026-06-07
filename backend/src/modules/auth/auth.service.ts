import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import speakeasy from "speakeasy";
import {
  signToken,
  signPendingToken,
  generateRefreshToken,
  hashToken,
  type JwtPayload,
  type UserRole,
} from "../../lib/jwt.js";
import { AppError, ConflictError, UnauthorizedError, NotFoundError } from "../../lib/errors.js";
import { env } from "../../lib/env.js";
import { sendEmail } from "../../lib/mailer.js";
import * as repo from "./auth.repository.js";

const INVALID = new UnauthorizedError("INVALID_CREDENTIALS", "Invalid email or password");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 60);
}

function refreshTokenExpiresAt(): Date {
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)d$/.exec(raw);
  if (!match) throw new Error(`Unsupported JWT_REFRESH_EXPIRES_IN format: ${raw}`);
  const days = parseInt(match[1]!, 10);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

export async function register(data: {
  email: string;
  password: string;
  name: string;
  tenantName: string;
}) {
  const existing = await repo.findUserByEmail(data.email);
  if (existing) {
    throw new ConflictError("EMAIL_IN_USE", "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const baseSlug = slugify(data.tenantName);
  // Ensure unique slug by appending a random suffix
  const slug = `${baseSlug}-${crypto.randomBytes(3).toString("hex")}`;

  const tenant = await repo.createTenantAndOwner({
    tenantName: data.tenantName,
    slug,
    email: data.email,
    passwordHash,
    name: data.name,
  });

  const owner = tenant.users[0];
  if (!owner) throw new AppError(500, "INTERNAL_ERROR", "Failed to create user");

  const payload: JwtPayload = {
    sub: owner.id,
    tenantId: tenant.id,
    role: owner.role as UserRole,
    email: owner.email,
  };

  const accessToken = signToken(payload);
  const rawRefreshToken = generateRefreshToken();
  await repo.createRefreshToken(owner.id, tenant.id, hashToken(rawRefreshToken), refreshTokenExpiresAt());

  return {
    accessToken,
    rawRefreshToken,
    user: { id: owner.id, name: owner.name, email: owner.email, role: owner.role },
    tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
  };
}

type LoginResult =
  | { requiresTwoFa: true; challengeToken: string }
  | {
      accessToken: string;
      rawRefreshToken: string;
      user: { id: string; name: string; email: string; role: string; twoFaEnabled: boolean };
    };

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await repo.findUserByEmail(email);
  if (!user || !user.isActive) throw INVALID;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw INVALID;

  const twoFaEnabled = user.twoFactorSecret?.verified ?? false;

  if (twoFaEnabled) {
    const challengeToken = signPendingToken({
      sub: user.id,
      tenantId: user.tenantId,
      scope: "pending_2fa",
    });
    return { requiresTwoFa: true as const, challengeToken };
  }

  const payload: JwtPayload = {
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role as UserRole,
    email: user.email,
  };

  const accessToken = signToken(payload);
  const rawRefreshToken = generateRefreshToken();
  await repo.createRefreshToken(user.id, user.tenantId, hashToken(rawRefreshToken), refreshTokenExpiresAt());

  return {
    accessToken,
    rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, twoFaEnabled: false },
  };
}

export async function getMe(userId: string, tenantId: string) {
  const { prisma } = await import("../../lib/prisma.js");
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, name: true, email: true, role: true, twoFactorSecret: { select: { verified: true } } },
  });
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    twoFaEnabled: user.twoFactorSecret?.verified ?? false,
  };
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await repo.findUserByEmail(email);
  // Always respond the same way to prevent user enumeration
  if (!user || !user.isActive) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await repo.createPasswordReset(user.id, tokenHash, expiresAt);

  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>You requested a password reset.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
    `,
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);
  const record = await repo.findPasswordReset(tokenHash);

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError(400, "INVALID_TOKEN", "Reset token is invalid or expired");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await repo.updateUserPassword(record.userId, passwordHash);
  await repo.markPasswordResetUsed(record.id);

  // Invalidate all refresh tokens
  await repo.deleteAllUserRefreshTokens(record.userId, record.user.tenantId);
}

export async function enable2fa(userId: string) {
  const secret = speakeasy.generateSecret({
    name: "SaaS Starter Kit",
    length: 20,
  });

  await repo.upsert2FASecret(userId, secret.base32);

  return {
    secret: secret.base32,
    otpAuthUrl: secret.otpauth_url ?? "",
  };
}

export async function verify2fa(userId: string, tenantId: string, code: string) {
  const record = await repo.find2FASecret(userId);
  if (!record) {
    throw new AppError(400, "2FA_NOT_SETUP", "2FA is not set up for this account");
  }

  const valid = speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token: code,
    window: 1,
  });

  if (!valid) {
    throw new AppError(400, "INVALID_CODE", "Invalid verification code");
  }

  await repo.verify2FASecret(userId);

  // Issue new tokens with 2FA confirmed
  const { prisma } = await import("../../lib/prisma.js");
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, email: true, name: true, role: true, tenantId: true },
  });
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");

  const payload: JwtPayload = {
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role as UserRole,
    email: user.email,
  };
  const accessToken = signToken(payload);
  const rawRefreshToken = generateRefreshToken();
  await repo.createRefreshToken(user.id, user.tenantId, hashToken(rawRefreshToken), refreshTokenExpiresAt());

  return { accessToken, rawRefreshToken };
}

export async function verify2faChallenge(
  userId: string,
  tenantId: string,
  code: string,
): Promise<{
  accessToken: string;
  rawRefreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}> {
  const record = await repo.find2FASecret(userId);
  if (!record || !record.verified) {
    throw new AppError(400, "2FA_NOT_ENABLED", "2FA is not enabled for this account");
  }

  const valid = speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token: code,
    window: 1,
  });
  if (!valid) {
    throw new AppError(400, "INVALID_CODE", "Invalid verification code");
  }

  const { prisma } = await import("../../lib/prisma.js");
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId },
    select: { id: true, email: true, name: true, role: true, tenantId: true },
  });
  if (!user) throw new NotFoundError("USER_NOT_FOUND", "User not found");

  const payload: JwtPayload = {
    sub: user.id,
    tenantId: user.tenantId,
    role: user.role as UserRole,
    email: user.email,
  };
  const accessToken = signToken(payload);
  const rawRefreshToken = generateRefreshToken();
  await repo.createRefreshToken(user.id, user.tenantId, hashToken(rawRefreshToken), refreshTokenExpiresAt());

  return {
    accessToken,
    rawRefreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function disable2fa(userId: string, code: string) {
  const record = await repo.find2FASecret(userId);
  if (!record || !record.verified) {
    throw new AppError(400, "2FA_NOT_ENABLED", "2FA is not enabled");
  }

  const valid = speakeasy.totp.verify({
    secret: record.secret,
    encoding: "base32",
    token: code,
    window: 1,
  });
  if (!valid) {
    throw new AppError(400, "INVALID_CODE", "Invalid verification code");
  }

  await repo.delete2FASecret(userId);
}
