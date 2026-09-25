/**
 * Axios HTTP client for the Codebase Atlas API.
 *
 * Configured with:
 * - Base URL from environment variable
 * - Credentials included (for session-based GitHub OAuth)
 * - Request interceptor: no-op (extend to attach JWT if you switch to stateless auth)
 * - Response interceptor: normalize errors into ApiError shape
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  withCredentials: true,          // send session cookies for OAuth2
  timeout: 30_000,                // 30s — generous for large graph fetches
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ── Request Interceptor ───────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Extend here to attach a Bearer token if you switch to JWT auth:
    // const token = useAuthStore.getState().token;
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;

    // Redirect to login on 401 (session expired or not authenticated)
    if (status === 401 && typeof window !== "undefined") {
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Normalize error shape for consistent handling across the app
    const apiError: ApiError = {
      status,
      message:
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
