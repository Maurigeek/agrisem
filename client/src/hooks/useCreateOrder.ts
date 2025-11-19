// src/hooks/useCreateOrder.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, CreateOrderPayload } from "@/services/orderService";

export function useCreateOrder() {
  const qc = useQueryClient();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || undefined : undefined;

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload, token || undefined),
    onSuccess: (data) => {
      // invalide les queries pertinentes (orders, cart, supplier-orders, etc.)
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["supplier-orders"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
