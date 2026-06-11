import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import {
  createContactSchema,
  updateContactSchema,
  contactIdSchema,
} from "./contacts.validators.js";
import * as contactsService from "./contacts.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/contacts
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
    const { contacts, total } = await contactsService.listContacts(req.tenantId!, { search, page, pageSize });
    res.json({ data: contacts, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

// GET /api/contacts/:id
router.get("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = contactIdSchema.parse(req.params);
    const contact = await contactsService.getContact(id, req.tenantId!);
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
});

// POST /api/contacts
router.post("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createContactSchema.parse(req.body);
    const contact = await contactsService.createContact(req.tenantId!, data, req.user?.sub);
    res.status(201).json({ data: contact });
  } catch (err) {
    next(err);
  }
});

// PUT /api/contacts/:id
router.put("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = contactIdSchema.parse(req.params);
    const data = updateContactSchema.parse(req.body);
    const contact = await contactsService.updateContact(id, req.tenantId!, data);
    res.json({ data: contact });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contacts/:id
router.delete("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = contactIdSchema.parse(req.params);
    await contactsService.deleteContact(id, req.tenantId!, req.user?.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as contactsRouter };
