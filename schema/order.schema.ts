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
