import * as SecureStore from "expo-secure-store";
import { MockHttpError, mockRequest } from "./mock/server";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Requests go to an in-memory mock of the API (src/services/mock) unless
 * EXPO_PUBLIC_USE_MOCK_API is "0". Sign-in is simulated there: any password works.
 */
export const USE_MOCK_API = process.env.EXPO_PUBLIC_USE_MOCK_API !== "0";

const TOKEN_KEY = "auth_token";

/**
 * In-memory cache to avoid SecureStore reads per request
 */
let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

async function getToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;

  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  inMemoryToken = token;
  return token;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  if (USE_MOCK_API) {
    try {
      return await mockRequest<T>(endpoint, options, token);
    } catch (error) {
      if (error instanceof MockHttpError) {
        if (error.status === 401) {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          setAuthToken(null);
        }
        throw new ApiError(error.message, error.status, { error: error.message });
      }
      throw error;
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Don’t assume JSON always exists
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid or expired
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      setAuthToken(null);
    }

    throw new ApiError(data?.error ?? "Request failed", response.status, data);
  }

  return data as T;
}
