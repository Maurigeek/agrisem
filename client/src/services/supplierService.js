"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOrderProof = exports.updateOrderStatus = exports.listOrders = exports.uploadProductImage = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.listProducts = void 0;
const axios_1 = __importDefault(require("axios"));
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api/v1";
const api = axios_1.default.create({
    baseURL: `${API_BASE}/supplier`,
});
/**
 * Retourne la configuration axios avec Authorization si le token est disponible
 */
const withAuth = (token) => {
    if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("accessToken") || undefined;
    }
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
        },
    };
};
//
// 🛍️ PRODUITS
//
const listProducts = async (token) => {
    const res = await api.get("/products", withAuth(token));
    return res.data?.data || res.data;
};
exports.listProducts = listProducts;
const getProduct = async (id, token) => {
    const res = await api.get(`/products/${id}`, withAuth(token));
    return res.data?.data || res.data;
};
exports.getProduct = getProduct;
const createProduct = async (payload, images, token) => {
    // If there are images -> send as FormData to API endpoint that expects multipart
    if (images && images.length > 0) {
        const fd = new FormData();
        // append basic fields
        Object.keys(payload).forEach(k => {
            if (payload[k] !== undefined && payload[k] !== null)
                fd.append(k, String(payload[k]));
        });
        images.forEach(img => fd.append("images", img));
        const res = await axios_1.default.post(`${API_BASE}/supplier/products`, fd, {
            headers: {
                Authorization: withAuth(token).headers.Authorization,
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data?.data || res.data;
    }
    else {
        const res = await api.post("/products", payload, withAuth(token));
        return res.data?.data || res.data;
    }
};
exports.createProduct = createProduct;
const updateProduct = async (id, payload, images, token) => {
    if (images && images.length > 0) {
        // first patch metadata, then upload images via separate endpoint addProductImages
        await api.patch(`/products/${id}`, payload, withAuth(token));
        const fd = new FormData();
        images.forEach(img => fd.append("images", img));
        const res = await axios_1.default.post(`${API_BASE}/supplier/products/${id}/images`, fd, {
            headers: {
                Authorization: withAuth(token).headers.Authorization,
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data?.data || res.data;
    }
    else {
        const res = await api.patch(`/products/${id}`, payload, withAuth(token));
        return res.data?.data || res.data;
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id, token) => {
    const res = await api.delete(`/products/${id}`, withAuth(token));
    return res.data?.data || res.data;
};
exports.deleteProduct = deleteProduct;
/**
 * 📸 Upload d'une image produit (multipart)
 */
const uploadProductImage = async (id, file, token) => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await axios_1.default.post(`${API_BASE}/supplier/products/${id}/images`, formData, {
        headers: {
            Authorization: withAuth(token).headers.Authorization,
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data?.data || res.data;
};
exports.uploadProductImage = uploadProductImage;
//
// 📦 COMMANDES
//
const listOrders = async (params, token) => {
    const res = await api.get("/orders", { ...withAuth(token), params });
    return res.data?.data || res.data;
};
exports.listOrders = listOrders;
/**
 * 🔄 Mise à jour du statut d'une commande
 */
const updateOrderStatus = async (id, status, token) => {
    const res = await api.patch(`/orders/${id}/status`, { status }, withAuth(token));
    return res.data?.data || res.data;
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * 📤 Upload d'une preuve de paiement
 */
const uploadOrderProof = async (orderId, file, token) => {
    const formData = new FormData();
    formData.append("proof", file);
    const res = await axios_1.default.post(`${API_BASE}/supplier/orders/${orderId}/upload-proof`, formData, {
        headers: {
            Authorization: withAuth(token).headers.Authorization,
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data?.data || res.data;
};
exports.uploadOrderProof = uploadOrderProof;
//
// 🌍 EXPORT GLOBAL
//
exports.default = {
    listProducts: exports.listProducts,
    getProduct: exports.getProduct,
    createProduct: exports.createProduct,
    updateProduct: exports.updateProduct,
    deleteProduct: exports.deleteProduct,
    uploadProductImage: exports.uploadProductImage,
    listOrders: exports.listOrders,
    updateOrderStatus: exports.updateOrderStatus,
    uploadOrderProof: exports.uploadOrderProof,
};
