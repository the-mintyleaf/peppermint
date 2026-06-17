import type { QueryParams } from "@peppermint/admin";
import type { Book, BooksFetchResponse } from "./books.types";

const MOCK_BOOKS: Book[] = [
  { id: "1", title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", isbn: "978-0-7432-7356-5", publishedYear: 1925, status: "available" },
  { id: "2", title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "978-0-06-112008-4", publishedYear: 1960, status: "checked-out" },
  { id: "3", title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "978-0-452-28423-4", publishedYear: 1949, status: "available" },
  { id: "4", title: "Sapiens", author: "Yuval Noah Harari", genre: "Non-fiction", isbn: "978-0-06-231609-7", publishedYear: 2011, status: "reserved" },
];

export async function fetchBooks(params?: QueryParams): Promise<BooksFetchResponse> {
  let data = [...MOCK_BOOKS];
  if (params?.filters?.status) {
    data = data.filter((b) => b.status === params.filters!.status);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    data = data.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }
  const page = params?.page ?? 1;
  const pageSize = params?.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  return { data: data.slice(start, start + pageSize), meta: { total: data.length, page, pageSize } };
}

export async function createBook(values: Partial<Book>): Promise<Book> {
  return { ...values, id: String(Date.now()) } as Book;
}

export async function updateBook(id: string, values: Partial<Book>): Promise<Book> {
  return { ...values, id } as Book;
}

export async function deleteBook(id: string): Promise<void> {
  void id;
}
