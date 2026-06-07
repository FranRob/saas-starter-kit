import "./lib/env.js";
import { env } from "./lib/env.js";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import crypto from "node:crypto";
import { generalLimiter } from "./lib/rateLimit.js";
import { errorHandler } from "./lib/errors.js";

// Route modules
import { authRouter } from "./modules/auth/auth.routes.js";
import { accountRouter } from "./modules/account/account.routes.js";
import { orgRouter } from "./modules/org/org.routes.js";
import { contactsRouter } from "./modules/contacts/contacts.routes.js";
import { productsRouter } from "./modules/products/products.routes.js";
import { notificationsRouter } from "./modules/notifications/notifications.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";

const app = express();

// 1. Request ID
app.use((_req, res, next) => {
  const id =
    (_req.headers["x-request-id"] as string | undefined) ?? crypto.randomUUID();
  res.setHeader("X-Request-Id", id);
  _req.headers["x-request-id"] = id;
  next();
});

// 2. HTTPS redirect in production
if (env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] === "http") {
      res.redirect(301, `https://${req.headers.host}${req.url}`);
      return;
    }
    next();
  });
}

// 3. Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
  }),
);

// 4. CORS
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// 5. Body parsing
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

// 6. Content-Type enforcement
app.use((req, res, next) => {
  const methodsWithBody = ["POST", "PUT", "PATCH"];
  if (
    methodsWithBody.includes(req.method) &&
    !req.is("application/json") &&
    !req.is("multipart/form-data")
  ) {
    res
      .status(415)
      .json({ error: { code: "UNSUPPORTED_MEDIA_TYPE", message: "Content-Type must be application/json" } });
    return;
  }
  next();
});

// 7. Rate limit
app.use(generalLimiter);

// 8. Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// 9. Routes
app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/org", orgRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/products", productsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/dashboard", dashboardRouter);

// 10. Error handler (must be last)
app.use(errorHandler);

export { app };
