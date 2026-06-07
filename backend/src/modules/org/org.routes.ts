import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated, authenticatedOwner } from "../../middleware/auth.middleware.js";
import { updateOrgSchema } from "./org.validators.js";
import * as orgService from "./org.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/org
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const org = await orgService.getOrg(req.tenantId!);
    res.json({ data: org });
  } catch (err) {
    next(err);
  }
});

// PUT /api/org — OWNER only
router.put("/", ...authenticatedOwner, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = updateOrgSchema.parse(req.body);
    const updated = await orgService.updateOrg(req.tenantId!, data);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export { router as orgRouter };
