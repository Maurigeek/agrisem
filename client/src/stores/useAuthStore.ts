import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "PRODUCER" | "SUPPLIER" | "ADMIN";
  orgName?: string;
  phone?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (user: User, accessToken: string, refreshToken?: string | null) => void;
  setTokens: (accessToken: string, refreshToken?: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // ✅ Définit complètement l’état utilisateur
      setAuth: (user, accessToken, refreshToken = null) =>
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        }),

      // ✅ Met à jour uniquement les tokens
      setTokens: (accessToken, refreshToken = null) =>
        set({
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
    }),
    {
      name: "auth-storage", // le nom du stockage local
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
