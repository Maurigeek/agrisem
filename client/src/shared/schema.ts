import { z } from "zod";

// ============================================
// ENUMS & TYPES
// ============================================

export type Role = "PRODUCER" | "SUPPLIER" | "ADMIN";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "BLOCKED";
export type ArticleStatus = "DRAFT" | "PUBLISHED";
export type TopicType = "PRODUCT" | "ORDER";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER";
export type AlertType = "DROUGHT" | "HEAVY_RAIN" | "DISEASE_RISK";
export type AlertChannel = "EMAIL" | "SMS" | "BOTH";
export type CartStatus = "ACTIVE" | "ORDERED";

// ============================================
// USER & AUTH
// ============================================

export interface User {
  id: number;
  email: string;
  phone?: string;
  role: Role;
  firstName: string;
  lastName: string;
  orgName?: string;
  isVerified: boolean;
  isSupplierVerified?: boolean;
}

export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["PRODUCER", "SUPPLIER", "ADMIN"]),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  orgName: z.string().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// ============================================
// ADDRESS
// ============================================

export interface Address {
  id: number;
  userId: number;
  label: string;
  country: string;
  region: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export const insertAddressSchema = z.object({
  label: z.string().min(1),
  country: z.string().min(1),
  region: z.string().min(1),
  city: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  isDefault: z.boolean().default(false),
});

export type InsertAddress = z.infer<typeof insertAddressSchema>;

// ============================================
// CATALOG (CULTURES & VARIETIES)
// ============================================

export interface Culture {
  id: number;
  name: string;
  code: string;
}

export interface Variety {
  id: number;
  cultureId: number;
  name: string;
  climateSuitability: Record<string, unknown>;
  description?: string;
  maturityDays: number;
}

// ============================================
// PRODUCTS
// ============================================

export interface Product {
  id: number;
  supplierId: number;
  varietyId: number;
  title: string;
  sku: string;
  priceCents: number;
  currency: string;
  stock: number;
  minOrderQty: number;
  images: string[];
  specs: Record<string, unknown>;
  status: ProductStatus;
  createdAt: string;
}

export const insertProductSchema = z.object({
  varietyId: z.number(),
  title: z.string().min(1),
  sku: z.string().min(1),
  priceCents: z.number().min(0),
  currency: z.string().default("XOF"),
  stock: z.number().min(0),
  minOrderQty: z.number().min(1),
  images: z.array(z.string()).default([]),
  specs: z.record(z.unknown()).default({}),
  status: z.enum(["DRAFT", "ACTIVE", "BLOCKED"]).default("DRAFT"),
});

export type InsertProduct = z.infer<typeof insertProductSchema>;

// ============================================
// CART
// ============================================

export interface Cart {
  id: number;
  userId: number;
  status: CartStatus;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  qty: number;
}

export const insertCartItemSchema = z.object({
  productId: z.number(),
  qty: z.number().min(1),
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export const updateCartItemSchema = z.object({
  qty: z.number().min(1),
});

export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;

// ============================================
// ORDERS
// ============================================

export interface Order {
  id: number;
  buyerId: number;
  supplierId: number;
  orderNumber: string;
  totalCents: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentProofUrl?: string;
  status: OrderStatus;
  shippingAddressId: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  title: string;
  priceCents: number;
  qty: number;
}

export const insertOrderSchema = z.object({
  shippingAddressId: z.number(),
  paymentMethod: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER"]),
  paymentProofUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;

// ============================================
// MESSAGING
// ============================================

export interface Thread {
  id: number;
  topicType: TopicType;
  topicId: number;
  buyerId: number;
  supplierId: number;
  lastMessageAt: string;
}

export interface Message {
  id: number;
  threadId: number;
  senderId: number;
  body: string;
  attachments?: string[];
  createdAt: string;
}

export const insertThreadSchema = z.object({
  topicType: z.enum(["PRODUCT", "ORDER"]),
  topicId: z.number(),
  supplierId: z.number(),
});

export type InsertThread = z.infer<typeof insertThreadSchema>;

export const insertMessageSchema = z.object({
  body: z.string().min(1),
  attachments: z.array(z.string()).optional(),
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;

// ============================================
// ARTICLES
// ============================================

export interface Article {
  id: number;
  title: string;
  slug: string;
  bodyMd: string;
  tags: string[];
  authorId: number;
  publishedAt?: string;
  status: ArticleStatus;
}

export const insertArticleSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  bodyMd: z.string().min(1),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type InsertArticle = z.infer<typeof insertArticleSchema>;

// ============================================
// WEATHER & ALERTS
// ============================================

export interface WeatherAlert {
  id: number;
  userId: number;
  type: AlertType;
  threshold: Record<string, unknown>;
  channel: AlertChannel;
  isActive: boolean;
  lastSentAt?: string;
}

export const insertWeatherAlertSchema = z.object({
  type: z.enum(["DROUGHT", "HEAVY_RAIN", "DISEASE_RISK"]),
  threshold: z.record(z.unknown()),
  channel: z.enum(["EMAIL", "SMS", "BOTH"]),
  isActive: z.boolean().default(true),
});

export type InsertWeatherAlert = z.infer<typeof insertWeatherAlertSchema>;

export interface WeatherForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  condition: string;
  rainfallMm: number;
  humidity: number;
}

export interface WeatherAdvice {
  forecast: WeatherForecast[];
  cumulativeRainfall: number;
  advice: string;
}

// ============================================
// ADMIN
// ============================================

export interface AdminStats {
  totalSuppliers: number;
  pendingSuppliers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenueCents: number;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  results: T[];
}
