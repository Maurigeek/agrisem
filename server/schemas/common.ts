import { z } from "zod";

export const RoleEnum = z.enum(["PRODUCER", "SUPPLIER", "ADMIN"]);
export const OrderStatusEnum = z.enum([
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const ProductStatusEnum = z.enum(["DRAFT", "ACTIVE", "BLOCKED"]);
export const ArticleStatusEnum = z.enum(["DRAFT", "PUBLISHED"]);
export const TopicTypeEnum = z.enum(["PRODUCT", "ORDER"]);
export const PaymentMethodEnum = z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]);
export const AlertTypeEnum = z.enum(["DROUGHT", "HEAVY_RAIN", "DISEASE_RISK"]);
export const AlertChannelEnum = z.enum(["EMAIL", "SMS", "BOTH"]);
export const CartStatusEnum = z.enum(["ACTIVE", "ORDERED"]);
