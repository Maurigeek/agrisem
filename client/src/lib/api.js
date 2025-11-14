"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const axios_1 = __importDefault(require("axios"));
exports.api = axios_1.default.create({
    baseURL: "http://localhost:5001/api/v1", // ton backend Express
    headers: { "Content-Type": "application/json" },
});
// Intercepteur pour ajouter le token automatiquement
exports.api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token)
        config.headers.Authorization = `Bearer ${token}`;
    return config;
});
// Gestion du refresh automatique
exports.api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken)
            return Promise.reject(error);
        try {
            const { data } = await axios_1.default.post("http://localhost:5001/api/v1/auth/refresh", { refreshToken });
            localStorage.setItem("accessToken", data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return (0, exports.api)(originalRequest);
        }
        catch (err) {
            localStorage.clear();
            window.location.href = "/auth/login";
            return Promise.reject(err);
        }
    }
    return Promise.reject(error);
});
