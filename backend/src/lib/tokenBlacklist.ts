import { redis } from "./redis.js";

const PREFIX = "token:blacklist:";

export async function blacklistToken(jti: string, ttlSeconds: number): Promise<void> {
  if (ttlSeconds <= 0) return;
  await redis.set(`${PREFIX}${jti}`, "1", "EX", ttlSeconds);
}

export async function isBlacklisted(jti: string): Promise<boolean> {
  try {
    const val = await redis.get(`${PREFIX}${jti}`);
    return val !== null;
  } catch {
    // Fail open — if Redis is down, don't block the request
    return false;
  }
}
