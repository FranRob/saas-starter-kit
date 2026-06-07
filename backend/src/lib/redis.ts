import { Redis } from "ioredis";
import { env } from "./env.js";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

if (env.NODE_ENV !== "production") globalForRedis.redis = redis;

redis.on("error", (err) => {
  console.error("[redis] connection error:", err);
});
