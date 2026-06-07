import type { Request, Response, NextFunction, RequestHandler } from "express";
import { AppError } from "../lib/errors.js";
import { verifyToken, verifyPendingToken } from "../lib/jwt.js";
import { isBlacklisted } from "../lib/tokenBlacklist.js";
import { prisma } from "../lib/prisma.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyToken(token);
    // Reject pending 2FA tokens — only valid on the 2FA verify endpoint
    if ("scope" in payload && (payload as { scope?: string }).scope === "pending_2fa") {
      next(new AppError(403, "PENDING_2FA_TOKEN", "Complete 2FA verification first"));
      return;
    }
    // Check token blacklist (fail-open: Redis errors handled inside isBlacklisted)
    if (payload.jti && (await isBlacklisted(payload.jti))) {
      next(new AppError(401, "TOKEN_REVOKED", "Token has been revoked"));
      return;
    }
    req.user = payload;
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

export async function requireTenant(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }

  const tenantId = req.user.tenantId;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true, slug: true },
  });

  if (!tenant) {
    next(new AppError(404, "TENANT_NOT_FOUND", "Tenant not found"));
    return;
  }

  req.tenantId = tenant.id;
  req.tenant = tenant;
  next();
}

export function requireRole(...roles: Array<"OWNER" | "ADMIN" | "MEMBER">) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !(roles as string[]).includes(role)) {
      next(new AppError(403, "FORBIDDEN", "Insufficient permissions"));
      return;
    }
    next();
  };
}

export function requirePending2FA(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    return;
  }
  const token = header.slice(7);
  try {
    req.pendingUser = verifyPendingToken(token);
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired challenge token"));
  }
}

// Composition helpers
export const authenticated: RequestHandler[] = [requireAuth, requireTenant];

export const authenticatedOwner: RequestHandler[] = [
  requireAuth,
  requireTenant,
  requireRole("OWNER"),
];

export const authenticatedAdmin: RequestHandler[] = [
  requireAuth,
  requireTenant,
  requireRole("OWNER", "ADMIN"),
];
