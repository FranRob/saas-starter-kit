import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import { getStats } from "./dashboard.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/dashboard
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contacts, products, unreadNotifications, users, recentContacts } = await getStats(req.tenantId!);
    res.json({
      data: {
        stats: { contacts, products, unreadNotifications, users },
        recentContacts,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/stats
router.get("/stats", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { contacts, products, unreadNotifications, users, recentContacts } = await getStats(req.tenantId!);
    res.json({ data: { contacts, products, unreadNotifications, users, recentContacts } });
  } catch (err) {
    next(err);
  }
});

export { router as dashboardRouter };
