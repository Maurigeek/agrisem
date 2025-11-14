import { z } from "zod";

export const ProductCreateSchema = z.object({
  title: z.string().min(3),
  sku: z.string().min(1).optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().length(3).default("XOF"),
  stock: z.number().int().nonnegative().default(0),
  minOrderQty: z.number().int().positive().default(1),
  images: z.array(z.string().url()).optional().default([]),
  specs: z.any().optional().default({}),
  status: z.enum(["DRAFT", "ACTIVE", "BLOCKED"]).optional().default("DRAFT"),
  varietyId: z.number().int().optional()
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const OrderStatusSchema = z.object({
  status: z.enum(["PENDING","CONFIRMED","PREPARING","SHIPPED","DELIVERED","CANCELLED"])
});
