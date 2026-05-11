import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type { ApiClientConfig } from './apiDispatch.types';

let config: ApiClientConfig = {
  tokenKey: 'access_token',
  refreshEndpoint: '/auth/refresh',
  onLogout: () => {},
  debug: false,
};

export function configureApiClient(options: ApiClientConfig): void {
  config = { ...options };
}

export function getConfig(): ApiClientConfig {
  return config;
}

const instance: AxiosInstance = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject bearer token
instance.interceptors.request.use((req: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem(config.tokenKey);
  if (token && req.headers) {
    req.headers['Authorization'] = `Bearer ${token}`;
  }
  if (config.debug) {
    console.debug('[api-client] request', req.method?.toUpperCase(), req.url, req.data ?? req.params);
  }
  return req;
});

// Track whether a refresh is already in flight to avoid parallel refresh calls
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function processQueue(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Response interceptor — handle 401, refresh token, retry
instance.interceptors.response.use(
  (response) => {
    if (config.debug) {
      console.debug('[api-client] response', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(instance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(config.refreshEndpoint, null, {
          headers: { 'Content-Type': 'application/json' },
        });
        const newToken: string = data?.access_token ?? data?.token ?? '';
        sessionStorage.setItem(config.tokenKey, newToken);
        instance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(newToken);
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        }
        return instance(originalRequest);
      } catch {
        config.onLogout();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { instance as axiosInstance };
