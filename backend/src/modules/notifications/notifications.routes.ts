import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import { z } from "zod";
import * as notificationsService from "./notifications.service.js";

const router: ReturnType<typeof Router> = Router();

const notificationIdSchema = z.object({ id: z.string().uuid() });

// GET /api/notifications
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const notifications = await notificationsService.listNotifications(req.tenantId!);
    res.json({ data: notifications });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/read-all — must be before /:id to avoid conflict
router.put("/read-all", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await notificationsService.markAllRead(req.tenantId!);
    res.json({ data: { message: "All notifications marked as read." } });
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = notificationIdSchema.parse(req.params);
    const notification = await notificationsService.markRead(id, req.tenantId!);
    res.json({ data: notification });
  } catch (err) {
    next(err);
  }
});

export { router as notificationsRouter };
