import axios from "axios";
import { api, setAccessToken } from "@/lib/api.axios";
import { LoginFormData, RegisterFormData } from "@/lib/auth.schema";
import { User } from "@/lib/types";
import { create } from "zustand";

const BASE_URL = process.env.BACKEND_BASE_URL ?? "http://localhost:3001/api";

let hydratingPromise: Promise<void> | null = null;

function setAuthCookie(value: boolean) {
    if (typeof document === "undefined") return;
    if (value) {
        document.cookie = `auth_session=true; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
        document.cookie = "auth_session=; path=/; max-age=0";
    }
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;

    login: (data: LoginFormData) => Promise<void>;
    register: (data: RegisterFormData) => Promise<void>;
    logout: () => Promise<void>;
    hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    login: async (dataForm: LoginFormData) => {
        const { data } = await api.post("/auth/login", dataForm);
        setAccessToken(data.accessToken);
        setAuthCookie(true);
        const { data: user } = await api.get("/auth/me");
        set({ user, isAuthenticated: true, isLoading: false });
    },

    register: async (dataForm: RegisterFormData) => {
        const { data } = await api.post("/auth/register", {
            email: dataForm.email,
            password: dataForm.password,
            organizationName: dataForm.organizationName,
            name: dataForm.name,
        });
        setAccessToken(data.accessToken);
        setAuthCookie(true);
        const { data: user } = await api.get("/auth/me");
        set({ user, isAuthenticated: true, isLoading: false });
    },

    hydrate: () => {
        if (hydratingPromise) return hydratingPromise;

        hydratingPromise = (async () => {
            try {
                // Usa axios raw para NO pasar por el interceptor de api.
                // Si este call falla con 401, el interceptor intentaría
                // refrescar llamando al mismo endpoint → loop infinito.
                const { data } = await axios.post(
                    `${BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true },
                );
                setAccessToken(data.accessToken);
                setAuthCookie(true);
                const { data: user } = await api.get("/auth/me");
                set({ user, isAuthenticated: true });
            } catch {
                set({ user: null, isAuthenticated: false });
                setAuthCookie(false);
            } finally {
                set({ isLoading: false });
            }
        })();

        return hydratingPromise;
    },

    logout: async () => {
        await api.post("/auth/logout").catch(() => {});
        setAccessToken(null);
        setAuthCookie(false);
        set({ user: null, isAuthenticated: false, isLoading: false });
    },
}));
