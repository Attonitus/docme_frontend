import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { LoginFormData, RegisterFormData } from '@/lib/auth.schema';
import { useRouter } from 'next/navigation';

// ──────────────────────────────────────────────
// Extrae el mensaje de error del backend de forma segura
// ──────────────────────────────────────────────
export function parseApiError(error: unknown): string {
  const err = error as { response?: { data?: { message?: string | string[] } } };
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg[0]; // class-validator devuelve array
  return msg ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
}

// ──────────────────────────────────────────────
// useLoginMutation
// ──────────────────────────────────────────────
export function useLoginMutation() {
  const login = useAuthStore((s) => s.login);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginFormData) => login(data),
    onSuccess: () => router.replace('/overview'),
  });
}

// ──────────────────────────────────────────────
// useRegisterMutation
// ──────────────────────────────────────────────
export function useRegisterMutation() {
  const register = useAuthStore((s) => s.register);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterFormData) => register(data),
    onSuccess: () => router.replace('/'),
  });
}

// ──────────────────────────────────────────────
// useLogoutMutation
// ──────────────────────────────────────────────
export function useLogoutMutation() {
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => router.replace('/login'),
  });
}

