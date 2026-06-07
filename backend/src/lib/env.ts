import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  ALLOWED_ORIGINS: z.string().default("http://localhost:4000"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  TWO_FA_ENCRYPTION_KEY: z
    .string()
    .min(32, "TWO_FA_ENCRYPTION_KEY must be at least 32 characters"),
  FRONTEND_URL: z.string().default("http://localhost:4000"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  // Email (nodemailer)
  EMAIL_FROM: z.string().email().default("noreply@example.com"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  // Demo tenant
  DEMO_TENANT_ID: z.string().optional(),
  DEMO_USER_EMAIL: z.string().email().default("demo@demo.com"),
  DEMO_USER_PASSWORD: z.string().default("Demo1234!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n"));
  process.exit(1);
}

export const env = parsed.data;
