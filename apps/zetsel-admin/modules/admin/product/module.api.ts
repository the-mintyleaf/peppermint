import type { QueryParams } from '@zetsel/admin';

export interface Product extends Record<string, unknown> {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  tags: string[];
  brand: string;
  sku: string;
  availabilityStatus: string;
  thumbnail: string;
}

interface DummyJsonResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface ProductsResponse {
  products: Product[];
  meta: { total: number };
}

export async function fetchProducts(params?: QueryParams): Promise<ProductsResponse> {
  const url = new URL('https://dummyjson.com/products');

  if (params) {
    url.searchParams.set('limit', String(params.pageSize));
    url.searchParams.set('skip', String((params.page - 1) * params.pageSize));
    if (params.sort[0]) {
      url.searchParams.set('sortBy', params.sort[0].field);
      url.searchParams.set('order', params.sort[0].direction);
    }
  }

  const baseEndpoint = params?.search
    ? 'https://dummyjson.com/products/search'
    : 'https://dummyjson.com/products';

  if (params?.search) url.searchParams.set('q', params.search);

  const finalUrl = baseEndpoint + '?' + url.searchParams.toString();
  const res = await fetch(finalUrl);
  if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);

  const data: DummyJsonResponse = await res.json();
  return { products: data.products, meta: { total: data.total } };
}
