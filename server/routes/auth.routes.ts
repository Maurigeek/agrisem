import { Router } from "express";
import {
  register,
  login,
  getProfile,
  refreshToken,
  verifyAccount,
  requestPasswordReset,
  resetPasswordConfirm,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { 
  RegisterSchema, 
  LoginSchema,
  RequestPasswordResetSchema,
  ResetPasswordConfirmSchema, 
} from "../schemas/user.schema";
import { addRouteToSwagger } from "../swagger.js";

const router = Router();

// 🔹 REGISTER
addRouteToSwagger("/auth/register", "post", RegisterSchema, {
  summary: "Créer un nouvel utilisateur (Producteur ou Fournisseur)",
  tags: ["Auth"],
  responses: {
    201: "Inscription réussie",
    400: "Requête invalide",
    500: "Erreur serveur",
  },
});

// 🔹 LOGIN
addRouteToSwagger("/auth/login", "post", LoginSchema, {
  summary: "Connexion utilisateur",
  tags: ["Auth"],
  responses: {
    200: "Connexion réussie",
    401: "Mot de passe invalide",
    404: "Utilisateur non trouvé",
  },
});

// 🔹 REFRESH TOKEN
addRouteToSwagger("/auth/refresh", "post", null, {
  summary: "Rafraîchir le token d'accès",
  tags: ["Auth"],
  responses: {
    200: "Nouveau token généré",
    401: "Token manquant",
    403: "Refresh token invalide",
  },
});

// 🔹 VERIFY ACCOUNT
addRouteToSwagger("/auth/verify", "get", null, {
  summary: "Vérifier un compte utilisateur via le lien e-mail",
  tags: ["Auth"],
  responses: {
    200: "Compte vérifié avec succès",
    400: "Lien invalide ou expiré",
  },
});

// 🔹 RESET PASSWORD (envoi mail)
addRouteToSwagger("/auth/reset", "post", null, {
  summary: "Envoyer un e-mail de réinitialisation de mot de passe",
  tags: ["Auth"],
  responses: {
    200: "Email envoyé (si l'utilisateur existe)",
    400: "Email manquant",
    500: "Erreur serveur",
  },
});

// 🔹 RESET CONFIRM
addRouteToSwagger("/auth/reset/confirm", "post", null, {
  summary: "Confirmer la réinitialisation du mot de passe",
  tags: ["Auth"],
  responses: {
    200: "Mot de passe réinitialisé avec succès",
    400: "Lien invalide ou expiré",
  },
});

// 🔹 Envoi du mail de reset
addRouteToSwagger("/auth/reset", "post", RequestPasswordResetSchema, {
  summary: "Envoyer un e-mail de réinitialisation de mot de passe",
  tags: ["Auth"],
  responses: {
    200: "Email envoyé (si l'utilisateur existe)",
    400: "Email manquant ou invalide",
    500: "Erreur serveur",
  },
});

// 🔹 Confirmation du reset
addRouteToSwagger("/auth/reset/confirm", "post", ResetPasswordConfirmSchema, {
  summary: "Confirmer la réinitialisation et définir un nouveau mot de passe",
  tags: ["Auth"],
  responses: {
    200: "Mot de passe réinitialisé avec succès",
    400: "Token invalide ou expiré",
    500: "Erreur serveur",
  },
});


// 🔹 GET PROFILE
addRouteToSwagger("/auth/me", "get", null, {
  summary: "Récupérer le profil utilisateur connecté",
  tags: ["Auth"],
  security: [{ BearerAuth: [] }],
  responses: {
    200: "Profil récupéré avec succès",
    401: "Non autorisé",
    404: "Utilisateur non trouvé",
  },
});

// --- ROUTES EXPRESS REELLES ---
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/verify", verifyAccount);
router.post("/reset", requestPasswordReset);
router.post("/reset/confirm", resetPasswordConfirm);
router.get("/me", verifyToken, getProfile);

export default router;
