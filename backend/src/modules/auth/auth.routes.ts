import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { loginLimiter, passwordResetLimiter, totpLimiter } from "../../lib/rateLimit.js";
import {
  registerBodySchema,
  loginBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  enable2faSchema,
  verify2faSchema,
} from "./auth.validators.js";
import * as authService from "./auth.service.js";
import { authenticated, requirePending2FA } from "../../middleware/auth.middleware.js";
import { blacklistToken } from "../../lib/tokenBlacklist.js";
import { hashToken, generateRefreshToken, signToken, type JwtPayload, type UserRole } from "../../lib/jwt.js";
import { env } from "../../lib/env.js";
import { findRefreshToken, deleteRefreshToken, createRefreshToken, findEmailVerification, deleteEmailVerification, setEmailVerified } from "./auth.repository.js";
import { logAudit } from "../../lib/audit.js";

const router: ReturnType<typeof Router> = Router();

const RT_COOKIE = "__rt";

function refreshCookieOptions() {
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)d$/.exec(raw);
  const days = match ? parseInt(match[1]!, 10) : 7;
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict" as const,
    maxAge: days * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

function refreshTokenExpiresAt(): Date {
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = /^(\d+)d$/.exec(raw);
  const days = match ? parseInt(match[1]!, 10) : 7;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = registerBodySchema.parse(req.body);
      const result = await authService.register(body);

      const { rawRefreshToken, ...clientResult } = result;
      res.cookie(RT_COOKIE, rawRefreshToken, refreshCookieOptions());
      res.status(201).json({ data: clientResult });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/login
router.post(
  "/login",
  loginLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginBodySchema.parse(req.body);
      const result = await authService.login(body.email, body.password);

      if ("requiresTwoFa" in result) {
        res.status(200).json({ data: result });
        return;
      }

      const { rawRefreshToken, ...clientResult } = result;
      res.cookie(RT_COOKIE, rawRefreshToken, refreshCookieOptions());
      res.status(200).json({ data: clientResult });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/refresh
router.post("/refresh", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken: string | undefined = req.cookies?.[RT_COOKIE];
    if (!rawToken) {
      res.status(401).json({ error: { code: "REFRESH_TOKEN_INVALID", message: "No refresh token provided" } });
      return;
    }

    const tokenHash = hashToken(rawToken);
    const stored = await findRefreshToken(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({ error: { code: "REFRESH_TOKEN_INVALID", message: "Refresh token invalid or expired" } });
      return;
    }

    // Rotate: delete old, create new
    await deleteRefreshToken(tokenHash, stored.user.tenantId);
    const newRaw = generateRefreshToken();
    await createRefreshToken(stored.userId, stored.user.tenantId, hashToken(newRaw), refreshTokenExpiresAt());

    const payload: JwtPayload = {
      sub: stored.user.id,
      tenantId: stored.user.tenantId,
      role: stored.user.role as UserRole,
      email: stored.user.email,
    };
    const accessToken = signToken(payload);

    res.cookie(RT_COOKIE, newRaw, refreshCookieOptions());
    res.status(200).json({ data: { accessToken } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post("/logout", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jti, exp } = req.user!;
    if (jti && exp) {
      const ttl = exp - Math.floor(Date.now() / 1000);
      await blacklistToken(jti, ttl);
    }

    const rawToken: string | undefined = req.cookies?.[RT_COOKIE];
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await deleteRefreshToken(tokenHash, req.tenantId!).catch(() => {
        // ignore — token may already be rotated/expired
      });
    }

    await logAudit({ action: "LOGOUT", entity: "User", entityId: req.user!.sub, userId: req.user!.sub, tenantId: req.tenantId! });

    res.clearCookie(RT_COOKIE, { path: "/" });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get("/me", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!.sub, req.tenantId!);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  passwordResetLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.forgotPassword(email);
      res.json({ data: { message: "If that email exists, a reset link was sent." } });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, password);
      res.json({ data: { message: "Password updated successfully." } });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/2fa/enable — generate secret + QR
router.post(
  "/2fa/enable",
  ...authenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.enable2fa(req.user!.sub);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/2fa/verify — confirm setup with first code
router.post(
  "/2fa/verify",
  totpLimiter,
  ...authenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = enable2faSchema.parse(req.body);
      const result = await authService.verify2fa(req.user!.sub, req.tenantId!, code);
      const { rawRefreshToken, ...clientResult } = result;
      res.cookie(RT_COOKIE, rawRefreshToken, refreshCookieOptions());
      res.json({ data: clientResult });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/2fa/challenge — complete login after 2FA
router.post(
  "/2fa/challenge",
  totpLimiter,
  requirePending2FA,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = verify2faSchema.parse(req.body);
      const pending = req.pendingUser!;
      const result = await authService.verify2faChallenge(pending.sub, pending.tenantId, code);
      const { rawRefreshToken, ...clientResult } = result;
      res.cookie(RT_COOKIE, rawRefreshToken, refreshCookieOptions());
      res.json({ data: clientResult });
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/auth/2fa/disable
router.post(
  "/2fa/disable",
  totpLimiter,
  ...authenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = verify2faSchema.parse(req.body);
      await authService.disable2fa(req.user!.sub, code);
      res.json({ data: { message: "2FA disabled successfully." } });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/auth/verify-email/:token
router.get("/verify-email/:token", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params["token"] as string;
    const tokenHash = hashToken(token);
    const record = await findEmailVerification(tokenHash);

    if (!record || record.expiresAt < new Date()) {
      res.status(400).json({ error: { code: "INVALID_TOKEN", message: "Verification token is invalid or expired" } });
      return;
    }

    await setEmailVerified(record.user.id);
    await deleteEmailVerification(record.id);

    res.json({ data: { message: "Email verified" } });
  } catch (err) {
    next(err);
  }
});

export { router as authRouter };
