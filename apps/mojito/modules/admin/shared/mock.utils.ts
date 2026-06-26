export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export async function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10,
): PaginatedResponse<T> {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: items.slice(startIndex, endIndex),
    meta: {
      total: items.length,
      page,
      pageSize,
    },
  };
}
