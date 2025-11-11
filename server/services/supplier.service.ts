// server/services/supplier.service.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * NOTE: all functions expect supplierId (the authenticated user's id)
 */

// PRODUCTS
export const listSupplierProducts = async (supplierId) => {
  return prisma.product.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
  });
};

export const getSupplierProduct = async (supplierId, productId) => {
  return prisma.product.findFirst({
    where: { id: productId, supplierId },
  });
};

export const createSupplierProduct = async (supplierId, payload) => {
  return prisma.product.create({
    data: {
      supplierId,
      title: payload.title,
      sku: payload.sku ?? `SKU-${Date.now()}`,
      priceCents: payload.priceCents,
      currency: payload.currency ?? "XOF",
      stock: payload.stock ?? 0,
      minOrderQty: payload.minOrderQty ?? 1,
      images: payload.images ?? [],
      specs: payload.specs ?? {},
      status: payload.status ?? "DRAFT",
      varietyId: payload.varietyId ?? null,
    },
  });
};

export const updateSupplierProduct = async (supplierId, productId, payload) => {
  // ensure product belongs to supplier
  const existing = await prisma.product.findUnique({ where: { id: productId }});
  if (!existing || existing.supplierId !== supplierId) return null;
  return prisma.product.update({
    where: { id: productId },
    data: {
      title: payload.title ?? undefined,
      sku: payload.sku ?? undefined,
      priceCents: payload.priceCents ?? undefined,
      currency: payload.currency ?? undefined,
      stock: payload.stock ?? undefined,
      minOrderQty: payload.minOrderQty ?? undefined,
      images: payload.images ?? undefined,
      specs: payload.specs ?? undefined,
      status: payload.status ?? undefined,
      varietyId: payload.varietyId ?? undefined,
    },
  });
};

export const deleteSupplierProduct = async (supplierId, productId) => {
  const existing = await prisma.product.findUnique({ where: { id: productId }});
  if (!existing || existing.supplierId !== supplierId) return null;
  return prisma.product.delete({ where: { id: productId }});
};

// ORDERS (supplier perspective)
export const listSupplierOrders = async (supplierId, opts = { page: 1, pageSize: 50 }) => {
  const orders = await prisma.order.findMany({
    where: { supplierId },
    orderBy: { createdAt: "desc" },
    include: {
      buyer: { select: { id: true, firstName: true, lastName: true, email: true } },
      items: true,
    },
    skip: (opts.page - 1) * opts.pageSize,
    take: opts.pageSize,
  });
  return orders;
};

export const updateOrderStatus = async (supplierId, orderId, status) => {
  // ensure order belongs to supplier
  const order = await prisma.order.findUnique({ where: { id: orderId }});
  if (!order || order.supplierId !== supplierId) return null;

  // business rule: don't allow regression? (we keep it simple)
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // Optionally: create audit log, notify buyer, etc.
  await prisma.auditLog.create({
    data: {
      actorId: supplierId,
      entity: "Order",
      entityId: orderId,
      action: `UPDATE_STATUS_${status}`,
      meta: { previousStatus: order.status },
    },
  });

  return updated;
};
