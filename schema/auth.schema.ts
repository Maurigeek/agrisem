import { z } from "zod";
import { RoleEnum } from "../common/enums";

export const RegisterSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
  phone: z.string().min(8).max(20).optional().nullable(),
  orgName: z.string().optional().nullable(),
  role: RoleEnum.default("PRODUCER"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;

import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;


import { z } from "zod";

export const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export const ResetPasswordConfirmSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(6),
});


export const UserResponseSchema = z.object({
  id: z.number(),
  email: z.string(),
  phone: z.string().nullable(),
  role: RoleEnum,
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  orgName: z.string().nullable(),
  isVerified: z.boolean(),
  isSupplierVerified: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});



export const UpdateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  orgName: z.string().optional().nullable(),
  avatarUrl: z.string().url().optional(),
  locale: z.string().optional(),
});


