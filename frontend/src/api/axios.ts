/**
 * axios.ts
 * Purpose: one shared Axios client for the Lead Finder API.
 *
 * Usage: import { api } from "@/api/axios" in API modules — not in UI components.
 */
import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL,
  timeout: 60_000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Standard success envelope from the Express backend */
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

/** Standard error envelope from the Express backend */
export type ApiErrorBody = {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

/**
 * Read a human-readable message from an Axios / API error.
 */
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Something went wrong";
}

// Request interceptor — room for auth tokens later
api.interceptors.request.use((config) => {
  // Example later:
  // const token = getToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — normalize logging; callers still use try/catch
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error(
        "[api]",
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response?.status,
        getApiErrorMessage(error)
      );
    }
    return Promise.reject(error);
  }
);
