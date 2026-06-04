'use client';

import { Stack, TextInput, Textarea, Button } from '@zetsel/ui';
import { useForm } from '@zetsel/ui';
import type { ProductCategoryFormProps } from './ProductCategoryForm.types';
import type { ProductCategory } from '../module.api';

export function ProductCategoryForm({
  initialValues,
  onSubmit,
  isLoading,
}: ProductCategoryFormProps) {
  const form = useForm<ProductCategory>({
    initialValues: initialValues ?? {
      id: '',
      name: '',
      slug: '',
      description: '',
      parent: undefined,
      image: undefined,
    },
    validate: {
      name: (value) => (!value ? 'Category name is required' : null),
      slug: (value) => (!value ? 'Slug is required' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
    onSubmit,
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
        <TextInput
          label="Category Name"
          placeholder="Enter category name"
          {...form.getInputProps('name')}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Slug"
          placeholder="category-slug"
          {...form.getInputProps('slug')}
          disabled={isLoading}
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter category description"
          {...form.getInputProps('description')}
          disabled={isLoading}
          required
          rows={3}
        />

        <TextInput
          label="Parent Category (Optional)"
          placeholder="Parent category ID or name"
          {...form.getInputProps('parent')}
          disabled={isLoading}
        />

        <TextInput
          label="Image URL (Optional)"
          placeholder="https://example.com/image.jpg"
          {...form.getInputProps('image')}
          disabled={isLoading}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? 'Update Category' : 'Create Category'}
        </Button>
      </Stack>
    </form>
  );
}
