"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: "Token manquant" });
    const token = authHeader.split(" ")[1];
    try {
        const secret = process.env.JWT_SECRET;
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        if (!decoded.userId) {
            return res.status(403).json({ message: "Token invalide (userId manquant)" });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        console.error("Erreur verifyToken:", error);
        return res.status(403).json({ message: "Token invalide" });
    }
};
exports.verifyToken = verifyToken;
