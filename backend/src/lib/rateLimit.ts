import rateLimit from "express-rate-limit";
import type { Request } from "express";
import { env } from "./env.js";

const isTest = env.NODE_ENV === "test";

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: { code: "RATE_LIMITED", message: "Too many requests, please try again later." },
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many login attempts, please try again later.",
    },
  },
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many password reset attempts, please try again later.",
    },
  },
});

export const totpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => req.ip ?? "unknown",
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: {
    error: {
      code: "RATE_LIMITED",
      message: "Too many verification attempts, please try again later.",
    },
  },
});
