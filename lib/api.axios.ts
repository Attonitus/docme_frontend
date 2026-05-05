import axios, { AxiosError } from 'axios';

const BASE_URL = process.env.BACKEND_BASE_URL ?? 'http://localhost:3001/api';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ──────────────────────────────────────────────
// Request interceptor — adjunta el access token
// ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ──────────────────────────────────────────────
// Response interceptor — renueva el access token
// automáticamente cuando recibe un 401
// ──────────────────────────────────────────────
let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as typeof error.config & { _retry?: boolean };

    // No intentar refresh si:
    // - No es 401
    // - Ya se reintentó
    // - La request fallida ES el propio endpoint de refresh (evitar loop)
    const isRefreshCall = original.url === '/auth/refresh';
    if (error.response?.status !== 401 || original._retry || isRefreshCall) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers!.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const newToken: string = data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      original.headers!.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      // Limpiar cookie para que el middleware redirija a /login
      if (typeof document !== 'undefined') {
        document.cookie = 'auth_session=; path=/; max-age=0';
      }
      // window.location.href es intencional: fuera de React no hay acceso al
      // router de Next.js. Un full reload asegura limpiar todo el estado.
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ──────────────────────────────────────────────
// Helpers para manejar el access token en memoria
// (en vez de localStorage — más seguro contra XSS)
// ──────────────────────────────────────────────
let _accessToken: string | null = null;

export const getAccessToken = () => _accessToken;
export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export async function ensureAccessToken(): Promise<string | null> {
  if (_accessToken) return _accessToken;
  try {
    const { data } = await axios.post(
      `${BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}