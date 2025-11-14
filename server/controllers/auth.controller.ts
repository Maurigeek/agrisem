import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendConfirmationEmail, sendResetPasswordEmail } from "../utils/email.js";
import { RegisterSchema, LoginSchema } from "../schemas/user.schema.js";

dotenv.config();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

// ============================================================
// 1️⃣  INSCRIPTION UTILISATEUR
// ============================================================
export const register = async (req: Request, res: Response) => {
  try {
    console.log("📥 Payload reçu:", req.body); // ← LOG IMPORTANT

    const parseResult = RegisterSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.error("❌ Erreur validation ZOD:", parseResult.error.errors);
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: parseResult.error.errors 
      });
    }

    const { email, password, role, firstName, lastName, phone, orgName } = parseResult.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.error("❌ Email déjà utilisé:", email);
      return res.status(400).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        firstName,
        lastName,
        phone,
        orgName,
        isVerified: false,
      },
    });

    // console.log("✅ Utilisateur créé:", user.id);

    return res.status(201).json({
      message:
        "Inscription réussie. Vérifiez votre e-mail pour confirmer votre compte.",
      user: { id: user.id, email: user.email, role: user.role },
    });

  } catch (error: any) {
    // console.error("🔥 ERREUR SERVER REGISTER:", error);

    if (error.code === "P2002" && error.meta?.target?.includes("phone")) {
      return res.status(400).json({
        message: "Ce numéro de téléphone est déjà utilisé.",
        field: "phone"
      });
    }

    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      return res.status(400).json({
        message: "Cet email est déjà utilisé.",
        field: "email"
      });
    }

    return res.status(500).json({ message: "Erreur serveur" });
  }


};


// ============================================================
// 2️⃣  CONNEXION UTILISATEUR
// ============================================================
export const login = async (req: Request, res: Response) => {
  try {
    const parseResult = LoginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Données invalides", errors: parseResult.error.errors });
    }

    const { email, password } = parseResult.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Mot de passe invalide" });

    const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================
// 3️⃣  RAFRAÎCHIR LE TOKEN
// ============================================================
export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Refresh token invalide" });

    const newAccessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Refresh token expiré ou invalide" });
  }
};

// ============================================================
// 4️⃣  VÉRIFIER LE COMPTE (EMAIL)
// ============================================================
export const verifyAccount = async (req: Request, res: Response) => {
  const token = req.query.token as string;
  if (!token) return res.status(400).json({ message: "Token manquant" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true },
    });

    res.json({ message: "Compte vérifié avec succès 🎉" });
  } catch (error) {
    res.status(400).json({ message: "Lien de vérification invalide ou expiré" });
  }
};

// ============================================================
// 5️⃣  DEMANDE DE RÉINITIALISATION DE MOT DE PASSE
// ============================================================
export const requestPasswordReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email requis" });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(200).json({ message: "Si cet email existe, un lien a été envoyé." });

    const resetToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendResetPasswordEmail(email, resetToken);
    res.json({ message: "Email de réinitialisation envoyé." });
  } catch (error) {
    console.error("Erreur reset request:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// ============================================================
// 6️⃣  CONFIRMATION RÉINITIALISATION MOT DE PASSE
// ============================================================
export const resetPasswordConfirm = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword)
    return res.status(400).json({ message: "Token et mot de passe requis" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || !user.resetToken || user.resetToken !== token)
      return res.status(400).json({ message: "Lien invalide" });

    if (user.resetTokenExp && user.resetTokenExp < new Date())
      return res.status(400).json({ message: "Lien expiré" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExp: null },
    });

    res.json({ message: "Mot de passe réinitialisé avec succès ✅" });
  } catch (error) {
    console.error("Erreur reset confirm:", error);
    res.status(400).json({ message: "Lien invalide ou expiré" });
  }
};

// ============================================================
// 7️⃣  PROFIL UTILISATEUR CONNECTÉ
// ============================================================
export const getProfile = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        orgName: true,
        isVerified: true,
      },
    });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json({ data: user });
  } catch (err) {
    console.error("Erreur profil:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
