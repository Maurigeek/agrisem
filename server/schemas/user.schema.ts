import { z } from "zod";

/**
 * Enum des rôles utilisateurs aligné avec Prisma
 */
export const RoleEnum = z.enum(["PRODUCER", "SUPPLIER", "ADMIN"]).describe(
  "Rôle utilisateur dans la plateforme"
);

/**
 * Schéma d'inscription utilisateur (/auth/register)
 */
export const RegisterSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .describe("Prénom de l'utilisateur"),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .describe("Nom de l'utilisateur"),
  orgName: z
    .string()
    .optional()
    .describe("Nom de l'organisation (pour les fournisseurs uniquement)"),
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .describe("E-mail de l'utilisateur"),
  phone: z
    .string()
    .min(8, "Numéro de téléphone trop court")
    .max(20)
    .optional()
    .describe("Téléphone de l'utilisateur"),
  password: z
    .string()
    .min(6, "Mot de passe trop court (6 caractères minimum)")
    .describe("Mot de passe de connexion"),
  role: RoleEnum.default("PRODUCER").describe("Rôle (producteur, fournisseur ou admin)"),
});

/**
 * Schéma de connexion utilisateur (/auth/login)
 */
export const LoginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

/**
 * Schéma de demande de réinitialisation de mot de passe (/auth/reset)
 */
export const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .describe("Adresse e-mail pour la réinitialisation du mot de passe"),
});

/**
 * Schéma de confirmation de réinitialisation (/auth/reset/confirm)
 */
export const ResetPasswordConfirmSchema = z.object({
  token: z
    .string()
    .min(10, "Token invalide ou trop court")
    .describe("Token envoyé par e-mail pour la réinitialisation du mot de passe"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères")
    .describe("Nouveau mot de passe de l'utilisateur"),
});

/**
 * Schéma de mise à jour du profil utilisateur
 */
export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  orgName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().optional(),
});

/**
 * Schéma de réponse utilisateur (pour la doc Swagger)
 */
export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  phone: z.string().nullable(),
  role: RoleEnum,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  orgName: z.string().nullable(),
  isVerified: z.boolean(),
  isSupplierVerified: z.boolean(),
  createdAt: z.string().describe("Date de création ISO"),
  updatedAt: z.string().describe("Date de mise à jour ISO"),
});

/**
 * Types TypeScript dérivés
 */
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RequestPasswordResetInput = z.infer<typeof RequestPasswordResetSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof ResetPasswordConfirmSchema>;
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
