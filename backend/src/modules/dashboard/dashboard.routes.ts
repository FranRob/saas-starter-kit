import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import { getStats } from "./dashboard.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/dashboard/stats
router.get("/stats", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await getStats(req.tenantId!);
    res.json({ data: stats });
  } catch (err) {
    next(err);
  }
});

export { router as dashboardRouter };
