import { AxiosError } from 'axios';
import { axiosInstance } from './interceptors';
import { enqueue } from './queue';
import type { ApiResponse, RequestOptions } from './apiDispatch.types';

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

const offlineResponse: ApiResponse<never> = {
  data: null,
  ok: false,
  status: 0,
  message: 'Offline — queued',
};

async function request<T>(
  method: 'get' | 'post' | 'patch' | 'delete',
  options: RequestOptions
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.request<T>({
      method,
      url: options.url,
      data: options.body,
      params: options.params,
      headers: options.headers,
    });
    return {
      data: response.data,
      ok: true,
      status: response.status,
      message: 'OK',
    };
  } catch (err) {
    const axiosErr = err as AxiosError<{ message?: string }>;
    return {
      data: null,
      ok: false,
      status: axiosErr.response?.status ?? 0,
      message: axiosErr.response?.data?.message ?? axiosErr.message ?? 'Request failed',
    };
  }
}

export const api = {
  get<T>(options: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
    return request<T>('get', options);
  },

  post<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    if (isOffline()) {
      enqueue(() => request<T>('post', options));
      return Promise.resolve(offlineResponse as ApiResponse<T>);
    }
    return request<T>('post', options);
  },

  patch<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    if (isOffline()) {
      enqueue(() => request<T>('patch', options));
      return Promise.resolve(offlineResponse as ApiResponse<T>);
    }
    return request<T>('patch', options);
  },

  del<T>(options: Omit<RequestOptions, 'body'>): Promise<ApiResponse<T>> {
    if (isOffline()) {
      enqueue(() => request<T>('delete', options));
      return Promise.resolve(offlineResponse as ApiResponse<T>);
    }
    return request<T>('delete', options);
  },

  login<T>(options: RequestOptions): Promise<ApiResponse<T>> {
    return request<T>('post', options);
  },
};
