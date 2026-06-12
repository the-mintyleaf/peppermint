export type BookStatus = "available" | "checked-out" | "reserved";

export interface Book extends Record<string, unknown> {
  id: string;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  publishedYear: number;
  status: BookStatus;
}

export interface BooksFetchResponse {
  data: Book[];
  meta: { total: number; page: number; pageSize: number };
}
