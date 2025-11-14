import { z } from "zod";
import { RoleEnum } from "../schema/common";


/* ============================================================
   REGISTER
============================================================ */

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
    .nullable()
    .describe("Nom de l'organisation (pour les fournisseurs uniquement)"),

  email: z
    .string()
    .email("Adresse e-mail invalide")
    .describe("E-mail de l'utilisateur"),

  phone: z
    .string()
    .min(8, "Numéro de téléphone trop court")
    .max(20, "Numéro de téléphone trop long")
    .optional()
    .nullable()
    .describe("Téléphone de l'utilisateur"),

  password: z
    .string()
    .min(6, "Mot de passe trop court (6 caractères minimum)")
    .describe("Mot de passe de connexion"),

  role: RoleEnum.default("PRODUCER").describe(
    "Rôle (producteur, fournisseur ou admin)"
  ),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

/* ============================================================
   LOGIN
============================================================ */

export const LoginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/* ============================================================
   RESET PASSWORD REQUEST
============================================================ */

export const RequestPasswordResetSchema = z.object({
  email: z
    .string()
    .email("Adresse e-mail invalide")
    .describe("Adresse e-mail pour la réinitialisation du mot de passe"),
});

export type RequestPasswordResetInput = z.infer<
  typeof RequestPasswordResetSchema
>;

/* ============================================================
   RESET PASSWORD CONFIRM
============================================================ */

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

export type ResetPasswordConfirmInput = z.infer<
  typeof ResetPasswordConfirmSchema
>;

/* ============================================================
   UPDATE USER
============================================================ */

export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  orgName: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/* ============================================================
   USER RESPONSE (Swagger / client)
============================================================ */

export const UserResponseSchema = z.object({
  id: z.number().describe("ID unique de l'utilisateur"),

  email: z
    .string()
    .email()
    .describe("Adresse e-mail de l'utilisateur"),

  phone: z.string().nullable().describe("Numéro de téléphone"),

  role: RoleEnum.describe("Rôle utilisateur"),

  firstName: z.string().nullable().describe("Prénom de l'utilisateur"),
  lastName: z.string().nullable().describe("Nom de famille"),

  orgName: z.string().nullable().describe("Organisation de l'utilisateur"),

  isVerified: z.boolean().describe("Statut de vérification du compte"),

  isSupplierVerified: z
    .boolean()
    .describe("Validation manuelle du fournisseur"),

  createdAt: z.string().describe("Date de création ISO"),

  updatedAt: z.string().describe("Date de mise à jour ISO"),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;
