

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001/api/v1";

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  orgName?: string;
  email: string;
  phone?: string;
  password: string;
  role?: "PRODUCER" | "SUPPLIER" | "ADMIN";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken?: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

// ======================================================
// 🔹 Register
// ======================================================
export const register = async (payload: RegisterPayload): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ======================================================
// 🔹 Login
// ======================================================
export const login = async (payload: LoginPayload): Promise<ApiResponse & Tokens> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ======================================================
// 🔹 Refresh Token
// ======================================================
export const refreshToken = async (token: string): Promise<ApiResponse & Tokens> => {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: token }),
  });
  return res.json();
};

// ======================================================
// 🔹 Verify Account (Email link)
// ======================================================
export const verifyAccount = async (token: string): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`);
  return res.json();
};

// ======================================================
// 🔹 Request Password Reset
// ======================================================
export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE}/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
};

// ======================================================
// 🔹 Confirm Password Reset
// ======================================================
export const resetPasswordConfirm = async (
  payload: ResetPasswordPayload
): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE}/auth/reset/confirm`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
};

// ======================================================
// 🔹 Get Profile (JWT required)
// ======================================================
export const getProfile = async (accessToken: string): Promise<ApiResponse> => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.json();
};

// ======================================================
// 🔹 Helper : Logout (local only)
// ======================================================
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

// ======================================================
// 🔹 Helper : Auto-refresh access token
// ======================================================
export const getValidAccessToken = async (): Promise<string | null> => {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return null;

  try {
    // On teste le token courant (simple heuristique)
    const payload = JSON.parse(atob(access!.split(".")[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();

    if (now < exp - 60000) return access; // encore valide pour > 1 min

    // Sinon, on régénère
    const data = await refreshToken(refresh);
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      return data.accessToken;
    }
    return null;
  } catch {
    return null;
  }
};
