import { api, setAccessToken } from "@/lib/api.axios";
import { LoginFormData, RegisterFormData } from "@/lib/auth.schema";
import { User } from "@/lib/types";
import { create } from "zustand";



interface AuthState {
    user: User | null,
    isLoading: boolean,
    isAuthenticated: boolean,


    login: (data: LoginFormData) => Promise<void>,
    register: (data: RegisterFormData) => Promise<void>,
    logout: () => void,
    hydrate: () => void,
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,

    login: async (dataForm: LoginFormData) => {
        try {
            const { data } = await api.post("/auth/login", dataForm);
            setAccessToken(data.accessToken);
            const { data: user } = await api.get("/auth/me");
            set({ user, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (dataForm: RegisterFormData) => {
        try {
            const { data } = await api.post("/auth/register", {
                email: dataForm.email,
                password: dataForm.password,
                organizationName: dataForm.organizationName,
                name: dataForm.name
            });
            setAccessToken(data.accessToken);
            const { data: user } = await api.get("/auth/me");
            set({ user, isAuthenticated: true });
        } catch (error) {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });

        }
    },


    hydrate: async () => {
        set({ isLoading: true });
        try {
            const { data } = await api.post('/auth/refresh');
            setAccessToken(data.accessToken);
            const { data: user } = await api.get('/auth/me');
            set({ user, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },

    logout: async () => {
        await api.post('/auth/logout').catch(() => { });
        setAccessToken(null);
        set({ user: null, isAuthenticated: false });
        window.location.href = '/';
    },

}))
