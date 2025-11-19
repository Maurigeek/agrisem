// client/src/services/orderService.ts
import axios from "axios";
const API_BASE = (import.meta.env.VITE_API_BASE || "/api/v1").replace(/\/$/, "");

export const createOrder = async (payload: any, token?: string) => {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios.post(`${API_BASE}/orders`, payload, { headers });
  return res.data;
};

export const payOrder = async (orderId: number, body: any, token?: string) => {
  const headers: any = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios.post(`${API_BASE}/orders/${orderId}/pay`, body, { headers });
  return res.data;
};

export const cancelOrder = async (orderId: number, token?: string) => {
  const headers: any = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await axios.post(`${API_BASE}/orders/${orderId}/cancel`, {}, { headers });
  return res.data;
};
