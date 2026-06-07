import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { authenticated } from "../../middleware/auth.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "./products.validators.js";
import * as productsService from "./products.service.js";

const router = Router();

// GET /api/products
router.get("/", ...authenticated, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productsService.listProducts(req.tenantId!);
    res.json({ data: products });
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
    const product = await productsService.createProduct(req.tenantId!, data);
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
    await productsService.deleteProduct(id, req.tenantId!);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export { router as productsRouter };
