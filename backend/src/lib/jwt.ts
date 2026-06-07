import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "./env.js";

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
  email: string;
  jti?: string;
  exp?: number;
}

export type UserRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Pending2FAPayload {
  sub: string;
  tenantId: string;
  scope: "pending_2fa";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign({ ...payload, jti: crypto.randomUUID() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function signPendingToken(payload: Pending2FAPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: "5m" } as jwt.SignOptions);
}

export function verifyPendingToken(token: string): Pending2FAPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as { scope?: string } & Pending2FAPayload;
  if (payload.scope !== "pending_2fa") {
    throw new Error("Not a pending 2FA token");
  }
  return payload;
}
