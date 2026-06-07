import type { JwtPayload, Pending2FAPayload } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantId?: string;
      tenant?: { id: string; name: string; slug: string };
      pendingUser?: Pending2FAPayload;
    }
  }
}

export {};
