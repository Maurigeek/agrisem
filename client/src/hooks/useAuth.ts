// client/src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { getValidAccessToken, getProfile as apiGetProfile, getProfile } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

// Définition explicite du type User minimal attendu
interface User {
  id: number;
  email: string;
  role: "PRODUCER" | "SUPPLIER" | "ADMIN";
  firstName?: string;
  lastName?: string;
  phone?: string;
  orgName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export const useAuth = () => {
  const setTokens = useAuthStore((s) => s.setTokens);
  const setUser = useAuthStore((s) => s.setUser);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getValidAccessToken();
        if (!mounted) return;

        if (token) {
          setTokens(token, localStorage.getItem("refreshToken"));

          // ✅ Récupère le profil utilisateur
          const profile = await apiGetProfile(token);
          apiGetProfile(token)

          // Vérifie où se trouve l'objet user
          const user: User | null =
            (profile && profile.data) ||
            (profile && profile.user) ||
            (profile && "id" in profile ? (profile as User) : null);

          if (user) {
            setUser(user);
          }
        }
      } catch (err) {
        console.error("Erreur useAuth:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setTokens, setUser]);

  return { loading, accessToken };
};
