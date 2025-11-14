"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = void 0;
// client/src/hooks/useAuth.ts
const react_1 = require("react");
const authService_1 = require("@/services/authService");
const useAuthStore_1 = require("@/stores/useAuthStore");
const useAuth = () => {
    const setTokens = (0, useAuthStore_1.useAuthStore)((s) => s.setTokens);
    const setUser = (0, useAuthStore_1.useAuthStore)((s) => s.setUser);
    const accessToken = (0, useAuthStore_1.useAuthStore)((s) => s.accessToken);
    const [loading, setLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        let mounted = true;
        (async () => {
            try {
                const token = await (0, authService_1.getValidAccessToken)();
                if (!mounted)
                    return;
                if (token) {
                    setTokens(token, localStorage.getItem("refreshToken"));
                    // ✅ Récupère le profil utilisateur
                    const profile = await (0, authService_1.getProfile)(token);
                    (0, authService_1.getProfile)(token);
                    // Vérifie où se trouve l'objet user
                    const user = (profile && profile.data) ||
                        (profile && profile.user) ||
                        (profile && "id" in profile ? profile : null);
                    if (user) {
                        setUser(user);
                    }
                }
            }
            catch (err) {
                console.error("Erreur useAuth:", err);
            }
            finally {
                if (mounted)
                    setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [setTokens, setUser]);
    return { loading, accessToken };
};
exports.useAuth = useAuth;
