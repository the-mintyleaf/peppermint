import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response: unwrap envelope + auto-refresh on 401 ────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(newToken: string) {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => {
    const raw = response.data;
    if (
      raw &&
      typeof raw === "object" &&
      raw.success === true &&
      "data" in raw
    ) {
      if (raw.meta && typeof raw.meta.count === "number") {
        // Paginated list: keep { data: [...], meta: { count, page, ... } }
        // so consumers can read both items and total count
        response.data = { data: raw.data, meta: raw.meta };
      } else {
        // Non-paginated: unwrap to the object directly
        response.data = raw.data;
      }
    }
    return response;
  },
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(api(original));
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken =
        typeof window !== "undefined"
          ? localStorage.getItem("refresh_token")
          : null;

      if (!refreshToken) throw new Error("No refresh token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        },
      );

      if (!res.ok) throw new Error("Refresh failed");

      const { data } = await res.json();
      const { access, refresh } = data;

      localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);

      processQueue(access);
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch {
      refreshQueue = [];
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/";
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
