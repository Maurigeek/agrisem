"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    // ✅ Définit complètement l’état utilisateur
    setAuth: (user, accessToken, refreshToken = null) => set({
        user,
        accessToken,
        refreshToken,
        isAuthenticated: true,
    }),
    // ✅ Met à jour uniquement les tokens
    setTokens: (accessToken, refreshToken = null) => set({
        accessToken,
        refreshToken,
        isAuthenticated: !!accessToken,
    }),
    // ✅ Met à jour uniquement le user
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    // ✅ Supprime tout (logout)
    logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
        });
    },
}), {
    name: "auth-storage", // le nom du stockage local
    partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
    }),
}));
