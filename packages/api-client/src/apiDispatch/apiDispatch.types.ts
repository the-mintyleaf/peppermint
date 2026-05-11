export interface ApiResponse<T> {
  data: T | null;
  ok: boolean;
  status: number;
  message: string;
}

export interface PaginationData {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface RequestOptions {
  url: string;
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface ApiClientConfig {
  tokenKey: string;
  refreshEndpoint: string;
  onLogout: () => void;
  debug?: boolean;
}
