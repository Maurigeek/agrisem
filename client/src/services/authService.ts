/* ======================================================
   CONFIG
====================================================== */
// BASE API
const API_BASE = import.meta.env.VITE_API_BASE;

// BASE MEDIA 
export const MEDIA_BASE =
  import.meta.env.VITE_MEDIA_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001";


export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  [key: string]: any;
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  // 🚨 Si HTTP code >= 400 → on LÈVE l’erreur
  if (!res.ok) {
    const error: any = new Error(data.message || "Erreur serveur");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

/* ======================================================
   REGISTER
====================================================== */
export const register = async (payload: any): Promise<ApiResponse> => {
  return request(`${API_BASE}/auth/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/* ======================================================
   LOGIN
====================================================== */
export const login = async (
  payload: any
): Promise<ApiResponse & Tokens> => {
  return request(`${API_BASE}/auth/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/* ======================================================
   REFRESH TOKEN
====================================================== */
export const refreshToken = async (token: string): Promise<ApiResponse & Tokens> => {
  return request(`${API_BASE}/auth/refresh`, {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
};

/* ======================================================
   VERIFY ACCOUNT
====================================================== */
export const verifyAccount = async (token: string): Promise<ApiResponse> => {
  return request(`${API_BASE}/auth/verify?token=${encodeURIComponent(token)}`);
};

/* ======================================================
   REQUEST PASSWORD RESET
====================================================== */
export const requestPasswordReset = async (email: string): Promise<ApiResponse> => {
  return request(`${API_BASE}/auth/reset`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

/* ======================================================
   CONFIRM RESET
====================================================== */
export const resetPasswordConfirm = async (
  payload: any
): Promise<ApiResponse> => {
  return request(`${API_BASE}/auth/reset/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

/* ======================================================
   GET PROFILE
====================================================== */
export const getProfile = async (accessToken: string): Promise<ApiResponse> => {
  return request(`${API_BASE}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

/* ======================================================
   LOGOUT
====================================================== */
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/* ======================================================
   AUTO REFRESH TOKEN
====================================================== */
export const getValidAccessToken = async (): Promise<string | null> => {
  const access = localStorage.getItem("accessToken");
  const refresh = localStorage.getItem("refreshToken");

  if (!refresh) return null;

  try {
    const payload = JSON.parse(atob(access!.split(".")[1]));
    const exp = payload.exp * 1000;
    const now = Date.now();

    if (now < exp - 60000) return access;

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
