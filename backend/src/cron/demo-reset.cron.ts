import cron from "node-cron";
import { resetDemoTenant } from "../modules/demo/demo.service.js";

export function startDemoResetCron(): void {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    try {
      await resetDemoTenant();
    } catch (err) {
      console.error("[demo-reset] Cron job failed:", err);
    }
  });

  console.log("[demo-reset] Cron scheduled: every hour");
}
