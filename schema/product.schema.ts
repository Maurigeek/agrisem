import { z } from "zod";
import { ProductStatusEnum } from "./common";

export const ProductSchema = z.object({
  varietyId: z.number(),
  title: z.string().min(1),
  sku: z.string().min(1),
  priceCents: z.number().min(0),
  currency: z.string().default("XOF"),
  stock: z.number().min(0),
  minOrderQty: z.number().min(1),
  images: z.array(z.string()).default([]),
  specs: z.record(z.unknown()).default({}),
  status: ProductStatusEnum.default("DRAFT"),
});
