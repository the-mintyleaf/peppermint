import { api } from '../apiDispatch/apiDispatch';
import type { ApiResponse } from '../apiDispatch/apiDispatch.types';

export function createGroupRecords<T>(
  url: string,
  items: unknown[]
): Promise<ApiResponse<T[]>> {
  return api.post<T[]>({ url, body: items });
}

export function editGroupRecords<T>(
  url: string,
  items: Array<{ id: string | number } & Record<string, unknown>>
): Promise<ApiResponse<T[]>> {
  return api.patch<T[]>({ url, body: items });
}

export function deleteGroupRecords(
  url: string,
  ids: Array<string | number>
): Promise<ApiResponse<void>> {
  return api.del<void>({ url, params: { ids } });
}
