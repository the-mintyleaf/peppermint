import type { QueryParams } from '@zetsel/admin';

export interface ProductCategory extends Record<string, unknown> {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCategoryResponse {
  categories: ProductCategory[];
  meta: { total: number };
}

export async function fetchProductCategories(params?: QueryParams): Promise<ProductCategoryResponse> {
  // Dummy data for now - replace with actual API call
  const dummyCategories: ProductCategory[] = [
    {
      id: '1',
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
      image: 'https://via.placeholder.com/50',
      createdAt: '2024-01-01',
    },
    {
      id: '2',
      name: 'Smartphones',
      slug: 'smartphones',
      description: 'Mobile phones and accessories',
      parent: '1',
      image: 'https://via.placeholder.com/50',
      createdAt: '2024-01-02',
    },
    {
      id: '3',
      name: 'Laptops',
      slug: 'laptops',
      description: 'Personal computers and notebooks',
      parent: '1',
      image: 'https://via.placeholder.com/50',
      createdAt: '2024-01-03',
    },
  ];

  return {
    categories: dummyCategories,
    meta: { total: dummyCategories.length },
  };
}

export async function createProductCategory(data: Partial<ProductCategory>): Promise<ProductCategory> {
  const newCategory: ProductCategory = {
    id: String(Date.now()),
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    parent: data.parent,
    image: data.image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return newCategory;
}

export async function updateProductCategory(id: string, data: Partial<ProductCategory>): Promise<ProductCategory> {
  const updated: ProductCategory = {
    id,
    name: data.name || '',
    slug: data.slug || '',
    description: data.description || '',
    parent: data.parent,
    image: data.image,
    updatedAt: new Date().toISOString(),
  };
  return updated;
}

export async function deleteProductCategory(id: string): Promise<void> {
  // API call to delete category
}
