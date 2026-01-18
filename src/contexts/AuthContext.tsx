import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, setAuthToken } from "../services/client";

const TOKEN_KEY = "auth_token";
const ONBOARDING_KEY = "onboarding_completed";

export type User = {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  hasFinishedOnboarding: boolean;
};

type AuthContextType = AuthState & {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: true,
    hasFinishedOnboarding: false,
  });

  useEffect(() => {
    bootstrapAuth();
  }, []);

  /**
   * App startup:
   * - Load token
   * - Validate it via /auth/me
   * - Fail closed if anything is invalid
   */
  async function bootstrapAuth() {
    try {
      const [token, onboardingFlag] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        AsyncStorage.getItem(ONBOARDING_KEY),
      ]);

      if (!token) {
        setState({
          token: null,
          user: null,
          isLoading: false,
          hasFinishedOnboarding: onboardingFlag === "true",
        });
        return;
      }

      setAuthToken(token);

      const { user } = await apiRequest<{ user: User }>("/api/auth/me");

      setState({
        token,
        user,
        isLoading: false,
        hasFinishedOnboarding: onboardingFlag === "true",
      });
    } catch {
      // Token invalid / expired
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthToken(null);

      setState({
        token: null,
        user: null,
        isLoading: false,
        hasFinishedOnboarding: false,
      });
    }
  }

  /**
   * Accepts a token only.
   * Identity is always resolved from backend.
   */
  async function signIn(token: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);

    const { user } = await apiRequest<{ user: User }>("/api/auth/me");

    setState((prev) => ({
      ...prev,
      token,
      user,
    }));
  }

  async function signOut() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setAuthToken(null);

    setState((prev) => ({
      ...prev,
      token: null,
      user: null,
    }));
  }

  async function completeOnboarding() {
    await AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setState((prev) => ({
      ...prev,
      hasFinishedOnboarding: true,
    }));
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
