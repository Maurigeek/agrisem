"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.listSupplierOrders = exports.deleteSupplierProduct = exports.updateSupplierProduct = exports.createSupplierProduct = exports.getSupplierProduct = exports.listSupplierProducts = void 0;
// server/services/supplier.service.ts
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * NOTE: all functions expect supplierId (the authenticated user's id)
 */
// PRODUCTS
const listSupplierProducts = async (supplierId) => {
    return prisma.product.findMany({
        where: { supplierId },
        orderBy: { createdAt: "desc" },
    });
};
exports.listSupplierProducts = listSupplierProducts;
const getSupplierProduct = async (supplierId, productId) => {
    return prisma.product.findFirst({
        where: { id: productId, supplierId },
    });
};
exports.getSupplierProduct = getSupplierProduct;
const createSupplierProduct = async (supplierId, payload) => {
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
exports.createSupplierProduct = createSupplierProduct;
const updateSupplierProduct = async (supplierId, productId, payload) => {
    // ensure product belongs to supplier
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.supplierId !== supplierId)
        return null;
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
exports.updateSupplierProduct = updateSupplierProduct;
const deleteSupplierProduct = async (supplierId, productId) => {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing || existing.supplierId !== supplierId)
        return null;
    return prisma.product.delete({ where: { id: productId } });
};
exports.deleteSupplierProduct = deleteSupplierProduct;
// ORDERS (supplier perspective)
const listSupplierOrders = async (supplierId, opts = { page: 1, pageSize: 50 }) => {
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
exports.listSupplierOrders = listSupplierOrders;
const updateOrderStatus = async (supplierId, orderId, status) => {
    // ensure order belongs to supplier
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.supplierId !== supplierId)
        return null;
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
exports.updateOrderStatus = updateOrderStatus;
