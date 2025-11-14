"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useSupplierProducts = useSupplierProducts;
exports.useCreateProduct = useCreateProduct;
exports.useUpdateProduct = useUpdateProduct;
exports.useDeleteProduct = useDeleteProduct;
exports.useUploadProductImage = useUploadProductImage;
exports.useSupplierOrders = useSupplierOrders;
exports.useUpdateOrderStatus = useUpdateOrderStatus;
exports.useUploadOrderProof = useUploadOrderProof;
// client/src/hooks/useSupplier.ts
const react_query_1 = require("@tanstack/react-query");
const supplierService_1 = __importDefault(require("@/services/supplierService"));
function useSupplierProducts() {
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useQuery)({
        queryKey: ["supplier-products"],
        queryFn: () => supplierService_1.default.listProducts(token),
    });
}
function useCreateProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: ({ payload, images }) => supplierService_1.default.createProduct(payload, images, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
    });
}
function useUpdateProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, payload, images }) => supplierService_1.default.updateProduct(id, payload, images, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
    });
}
function useDeleteProduct() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: (id) => supplierService_1.default.deleteProduct(id, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
    });
}
function useUploadProductImage() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, file }) => supplierService_1.default.uploadProductImage(id, file, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-products"] }),
    });
}
function useSupplierOrders() {
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useQuery)({
        queryKey: ["supplier-orders"],
        queryFn: () => supplierService_1.default.listOrders({}, token),
    });
}
function useUpdateOrderStatus() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: ({ id, status }) => supplierService_1.default.updateOrderStatus(id, status, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-orders"] }),
    });
}
function useUploadOrderProof() {
    const qc = (0, react_query_1.useQueryClient)();
    const token = localStorage.getItem("accessToken") || undefined;
    return (0, react_query_1.useMutation)({
        mutationFn: ({ orderId, file }) => supplierService_1.default.uploadOrderProof(orderId, file, token),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["supplier-orders"] }),
    });
}
