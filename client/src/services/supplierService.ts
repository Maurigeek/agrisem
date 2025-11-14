import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api/v1";

const api = axios.create({
  baseURL: `${API_BASE}/supplier`,
});

/**
 * Retourne la configuration axios avec Authorization si le token est disponible
 */
const withAuth = (token?: string) => {
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
export const listProducts = async (token?: string) => {
  const res = await api.get("/products", withAuth(token));
  return res.data?.data || res.data;
};

export const getProduct = async (id: number, token?: string) => {
  const res = await api.get(`/products/${id}`, withAuth(token));
  return res.data?.data || res.data;
};

export const createProduct = async (payload: any, images?: File[], token?: string) => {
  // If there are images -> send as FormData to API endpoint that expects multipart
  if (images && images.length > 0) {
    const fd = new FormData();
    // append basic fields
    Object.keys(payload).forEach(k => {
      if (payload[k] !== undefined && payload[k] !== null) fd.append(k, String(payload[k]));
    });
    images.forEach(img => fd.append("images", img));
    const res = await axios.post(`${API_BASE}/supplier/products`, fd, {
      headers: {
        Authorization: withAuth(token).headers.Authorization,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data?.data || res.data;
  } else {
    const res = await api.post("/products", payload, withAuth(token));
    return res.data?.data || res.data;
  }
};

export const updateProduct = async (id: number, payload: any, images?: File[], token?: string) => {
  if (images && images.length > 0) {
    // first patch metadata, then upload images via separate endpoint addProductImages
    await api.patch(`/products/${id}`, payload, withAuth(token));
    const fd = new FormData();
    images.forEach(img => fd.append("images", img));
    const res = await axios.post(`${API_BASE}/supplier/products/${id}/images`, fd, {
      headers: {
        Authorization: withAuth(token).headers.Authorization,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data?.data || res.data;
  } else {
    const res = await api.patch(`/products/${id}`, payload, withAuth(token));
    return res.data?.data || res.data;
  }
};

export const deleteProduct = async (id: number, token?: string) => {
  const res = await api.delete(`/products/${id}`, withAuth(token));
  return res.data?.data || res.data;
};

/**
 * 📸 Upload d'une image produit (multipart)
 */
export const uploadProductImage = async (id: number, file: File, token?: string) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axios.post(`${API_BASE}/supplier/products/${id}/images`, formData, {
    headers: {
      Authorization: withAuth(token).headers.Authorization,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data?.data || res.data;
};

//
// 📦 COMMANDES
//
export const listOrders = async (
  params?: { page?: number; page_size?: number },
  token?: string
) => {
  const res = await api.get("/orders", { ...withAuth(token), params });
  return res.data?.data || res.data;
};

/**
 * 🔄 Mise à jour du statut d'une commande
 */
export const updateOrderStatus = async (id: number, status: string, token?: string) => {
  const res = await api.patch(`/orders/${id}/status`, { status }, withAuth(token));
  return res.data?.data || res.data;
};

/**
 * 📤 Upload d'une preuve de paiement
 */
export const uploadOrderProof = async (orderId: number, file: File, token?: string) => {
  const formData = new FormData();
  formData.append("proof", file);

  const res = await axios.post(`${API_BASE}/supplier/orders/${orderId}/upload-proof`, formData, {
    headers: {
      Authorization: withAuth(token).headers.Authorization,
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data?.data || res.data;
};

//
// 🌍 EXPORT GLOBAL
//
export default {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  listOrders,
  updateOrderStatus,
  uploadOrderProof,
};
