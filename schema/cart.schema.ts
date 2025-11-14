import { z } from "zod";

export const InsertCartItemSchema = z.object({
  productId: z.number(),
  qty: z.number().min(1),
});

export const UpdateCartItemSchema = z.object({
  qty: z.number().min(1),
});
