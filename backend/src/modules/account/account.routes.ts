import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import { updateProfileSchema, changePasswordSchema } from "./account.validators.js";
import * as accountService from "./account.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/account
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await accountService.getProfile(req.user!.sub, req.tenantId!);
    res.json({ data: profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/account
router.put("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = updateProfileSchema.parse(req.body);
    const updated = await accountService.updateProfile(req.user!.sub, req.tenantId!, name);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

// PUT /api/account/password
router.put("/password", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    await accountService.changePassword(req.user!.sub, req.tenantId!, currentPassword, newPassword);
    res.json({ data: { message: "Password changed successfully." } });
  } catch (err) {
    next(err);
  }
});

export { router as accountRouter };
