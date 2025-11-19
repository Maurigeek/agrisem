// server/schemas/order.schema.ts
import { z } from "zod";

export const OrderItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive().min(1),
  // optional: price and supplierId are useful for optimistic frontends
  priceCents: z.number().int().optional(),
  supplierId: z.number().int().optional(),
});

export const OrderAddressSchema = z.object({
  label: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  city: z.string().min(1),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  address: OrderAddressSchema,
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]),
  notes: z.string().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
