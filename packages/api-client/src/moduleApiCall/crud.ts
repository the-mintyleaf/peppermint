import { api } from '../apiDispatch/apiDispatch';
import type { ApiResponse, RequestOptions } from '../apiDispatch/apiDispatch.types';

export function getRecords<T>(
  url: string,
  params?: Record<string, unknown>
): Promise<ApiResponse<T[]>> {
  return api.get<T[]>({ url, params });
}

export function getSingleRecord<T>(
  url: string,
  id: string | number
): Promise<ApiResponse<T>> {
  return api.get<T>({ url: `${url}/${id}` });
}

export function createRecord<T>(
  url: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return api.post<T>({ url, body });
}

export function editRecord<T>(
  url: string,
  id: string | number,
  body: unknown
): Promise<ApiResponse<T>> {
  const options: RequestOptions = { url: `${url}/${id}`, body };
  return api.patch<T>(options);
}

export function deleteRecord(
  url: string,
  id: string | number
): Promise<ApiResponse<void>> {
  return api.del<void>({ url: `${url}/${id}` });
}
