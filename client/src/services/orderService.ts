// src/services/orderService.ts
const API_BASE = (import.meta.env.VITE_API_BASE || "/api/v1").replace(/\/$/, "");

export type OrderItemInput = {
  productId: number;
  qty: number;
};

export type CreateOrderPayload = {
  items: OrderItemInput[];
  address: {
    label: string;
    country: string;
    region: string;
    city: string;
  };
  paymentMethod: "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER";
  notes?: string | null;
};

export async function createOrder(payload: CreateOrderPayload, token?: string) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let json;
    try { json = JSON.parse(text); } catch { json = { message: text || "Erreur serveur" }; }
    throw json;
  }

  return res.json();
}
