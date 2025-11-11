import { useEffect } from "react";
import { useLocation } from "wouter";
import { getValidAccessToken, getProfile } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/hooks/use-toast";

/**
 * Protège les routes nécessitant une authentification
 * Vérifie le token et recharge le profil utilisateur si besoin
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, setAuth } = useAuthStore();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        let token = localStorage.getItem("accessToken");
        if (!token) token = await getValidAccessToken();

        if (!token) {
          toast({ title: "Session expirée", description: "Veuillez vous reconnecter." });
          navigate("/auth/login");
          return;
        }

        // Si l'utilisateur n'est pas encore chargé, on récupère son profil
        if (!user) {
          const profile = await getProfile(token);
          if (profile?.data) setAuth(profile.data, token);
        }
      } catch (error) {
        console.error("Erreur ProtectedRoute:", error);
        toast({ title: "Authentification requise", description: "Veuillez vous reconnecter." });
        navigate("/auth/login");
      }
    })();
  }, [navigate, toast, user, setAuth]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Chargement...
      </div>
    );
  }

  return <>{children}</>;
}
