"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCartStore = exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => set({ user, token }),
    clearAuth: () => set({ user: null, token: null }),
}), {
    name: 'agrisem-auth',
}));
exports.useCartStore = (0, zustand_1.create)()((0, middleware_1.persist)((set, get) => ({
    items: [],
    addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.productId === item.productId);
        if (existingItem) {
            return {
                items: state.items.map(i => i.productId === item.productId
                    ? { ...i, qty: i.qty + item.qty }
                    : i),
            };
        }
        return { items: [...state.items, item] };
    }),
    updateItem: (id, qty) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, qty } : i),
    })),
    removeItem: (id) => set((state) => ({
        items: state.items.filter(i => i.id !== id),
    })),
    clearCart: () => set({ items: [] }),
    getTotal: () => {
        const items = get().items;
        return items.reduce((sum, item) => {
            const price = item.product?.priceCents || 0;
            return sum + (price * item.qty);
        }, 0);
    },
    getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0);
    },
}), {
    name: 'agrisem-cart',
}));
