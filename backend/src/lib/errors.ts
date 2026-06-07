import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "./env.js";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class BadRequestError extends DomainError {}
export class UnprocessableError extends DomainError {}

const DOMAIN_STATUS: ReadonlyMap<Function, number> = new Map([
  [NotFoundError, 404],
  [ConflictError, 409],
  [ForbiddenError, 403],
  [UnauthorizedError, 401],
  [BadRequestError, 400],
  [UnprocessableError, 422],
]);

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof DomainError) {
    const status = DOMAIN_STATUS.get(err.constructor) ?? 500;
    res.status(status).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request data",
        details: err.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      },
    });
    return;
  }

  // Prisma unique constraint
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2002"
  ) {
    res.status(409).json({
      error: { code: "CONFLICT", message: "Resource already exists" },
    });
    return;
  }

  // Prisma not found
  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "P2025"
  ) {
    res.status(404).json({
      error: { code: "NOT_FOUND", message: "Resource not found" },
    });
    return;
  }

  const isDev = env.NODE_ENV !== "production";
  const message = err instanceof Error ? err.message : "Internal server error";

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: isDev ? message : "Internal server error",
      ...(isDev && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
