// client/src/hooks/useSupplier.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import supplierService from "@/services/supplierService";

export function useSupplierProducts() {
  const token = localStorage.getItem("accessToken") || undefined;
  return useQuery({
    queryKey: ["supplier-products"],
    queryFn: () => supplierService.listProducts(token),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: ({ payload, images }: { payload: any; images?: File[] }) =>
  supplierService.createProduct(payload, images, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: ({ id, payload, images }: { id: number; payload: any; images?: File[] }) =>
      supplierService.updateProduct(id, payload, images, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: (id: number) => supplierService.deleteProduct(id, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      supplierService.uploadProductImage(id, file, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
  });
}

export function useSupplierOrders() {
  const token = localStorage.getItem("accessToken") || undefined;
  return useQuery({
    queryKey: ["supplier-orders"],
    queryFn: () => supplierService.listOrders({}, token),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      supplierService.updateOrderStatus(id, status, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-orders"] }),
  });
}

export function useUploadOrderProof() {
  const qc = useQueryClient();
  const token = localStorage.getItem("accessToken") || undefined;
  return useMutation({
    mutationFn: ({ orderId, file }: { orderId: number; file: File }) =>
      supplierService.uploadOrderProof(orderId, file, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-orders"] }),
  });
}
