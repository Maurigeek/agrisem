"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidAccessToken = exports.logout = exports.getProfile = exports.resetPasswordConfirm = exports.requestPasswordReset = exports.verifyAccount = exports.refreshToken = exports.login = exports.register = void 0;
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api/v1";
// ======================================================
// 🔹 Register
// ======================================================
const register = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
};
exports.register = register;
// ======================================================
// 🔹 Login
// ======================================================
const login = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
};
exports.login = login;
// ======================================================
// 🔹 Refresh Token
// ======================================================
const refreshToken = async (token) => {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: token }),
    });
    return res.json();
};
exports.refreshToken = refreshToken;
// ======================================================
// 🔹 Verify Account (Email link)
// ======================================================
const verifyAccount = async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`);
    return res.json();
};
exports.verifyAccount = verifyAccount;
// ======================================================
// 🔹 Request Password Reset
// ======================================================
const requestPasswordReset = async (email) => {
    const res = await fetch(`${API_BASE}/auth/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    return res.json();
};
exports.requestPasswordReset = requestPasswordReset;
// ======================================================
// 🔹 Confirm Password Reset
// ======================================================
const resetPasswordConfirm = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/reset/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return res.json();
};
exports.resetPasswordConfirm = resetPasswordConfirm;
// ======================================================
// 🔹 Get Profile (JWT required)
// ======================================================
const getProfile = async (accessToken) => {
    const res = await fetch(`${API_BASE}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return res.json();
};
exports.getProfile = getProfile;
// ======================================================
// 🔹 Helper : Logout (local only)
// ======================================================
const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
};
exports.logout = logout;
// ======================================================
// 🔹 Helper : Auto-refresh access token
// ======================================================
const getValidAccessToken = async () => {
    const access = localStorage.getItem("accessToken");
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh)
        return null;
    try {
        // On teste le token courant (simple heuristique)
        const payload = JSON.parse(atob(access.split(".")[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        if (now < exp - 60000)
            return access; // encore valide pour > 1 min
        // Sinon, on régénère
        const data = await (0, exports.refreshToken)(refresh);
        if (data.accessToken) {
            localStorage.setItem("accessToken", data.accessToken);
            return data.accessToken;
        }
        return null;
    }
    catch {
        return null;
    }
};
exports.getValidAccessToken = getValidAccessToken;
