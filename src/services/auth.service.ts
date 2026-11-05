import { useAuth } from "@/src/contexts/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "./client";

type LoginRequest = {
  email: string;
  password: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  name: string;
};

type AuthResponse = {
  token: string;
};

export function useLogin() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      apiRequest<AuthResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: async ({ token }) => {
      await signIn(token);
    },
  });
}

/** Deletes the signed-in account for good, then signs out. */
export function useDeleteAccount() {
  const { signOut } = useAuth();

  return useMutation({
    mutationFn: () => apiRequest<{ deleted: true }>("/api/auth/me", { method: "DELETE" }),
    onSuccess: () => signOut(),
  });
}

export function useRegister() {
  const { signIn } = useAuth();

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      apiRequest<AuthResponse>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: async ({ token }) => {
      await signIn(token);
    },
  });
}
