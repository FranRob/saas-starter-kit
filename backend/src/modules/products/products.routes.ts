import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "./products.validators.js";
import * as productsService from "./products.service.js";

const router: ReturnType<typeof Router> = Router();

// GET /api/products
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;
    const { products, total } = await productsService.listProducts(req.tenantId!, { search, page, pageSize });
    res.json({ data: products, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const product = await productsService.getProduct(id, req.tenantId!);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products
router.post("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(req.tenantId!, data, req.user?.sub);
    res.status(201).json({ data: product });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id
router.put("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    const data = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(id, req.tenantId!, data);
    res.json({ data: product });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id
router.delete("/:id", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = productIdSchema.parse(req.params);
    await productsService.deleteProduct(id, req.tenantId!, req.user?.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as productsRouter };
