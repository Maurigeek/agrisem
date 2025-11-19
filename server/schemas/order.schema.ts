import { z } from "zod";
import { PaymentMethodEnum, OrderStatusEnum } from "./common";

export const InsertOrderSchema = z.object({
  shippingAddressId: z.number(),
  paymentMethod: PaymentMethodEnum,
  paymentProofUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusEnum,
});


import { z } from "zod";

export const orderCreateSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number(),
      qty: z.number().min(1)
    })
  ).min(1),

  address: z.object({
    label: z.string().min(1),
    country: z.string().min(1),
    region: z.string().min(1),
    city: z.string().min(1),
  }),

  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]),
  
  notes: z.string().optional(),
});

export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
