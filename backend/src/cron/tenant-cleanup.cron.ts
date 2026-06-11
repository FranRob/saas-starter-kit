import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { env } from "../lib/env.js";

const TRIAL_TTL_HOURS = 2;

export function startTenantCleanupCron(): void {
  cron.schedule("30 * * * *", async () => {
    try {
      const cutoff = new Date(Date.now() - TRIAL_TTL_HOURS * 60 * 60 * 1000);

      const expired = await prisma.tenant.findMany({
        where: {
          createdAt: { lt: cutoff },
          ...(env.DEMO_TENANT_ID ? { id: { not: env.DEMO_TENANT_ID } } : {}),
        },
        select: { id: true, name: true },
      });

      if (expired.length === 0) return;

      console.log(`[tenant-cleanup] Removing ${expired.length} expired trial tenant(s)...`);

      for (const tenant of expired) {
        await prisma.auditLog.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.notification.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.product.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.contact.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.invitation.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.user.deleteMany({ where: { tenantId: tenant.id } });
        await prisma.tenant.delete({ where: { id: tenant.id } });
        console.log(`[tenant-cleanup] Removed tenant: ${tenant.name} (${tenant.id})`);
      }
    } catch (err) {
      console.error("[tenant-cleanup] Cron job failed:", err);
    }
  });

  console.log(`[tenant-cleanup] Cron scheduled: every hour at :30 (TTL: ${TRIAL_TTL_HOURS}h)`);
}
