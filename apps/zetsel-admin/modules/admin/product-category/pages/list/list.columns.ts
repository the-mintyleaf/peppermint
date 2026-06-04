import type { DataTableShellColumn } from '@zetsel/admin';
import type { ProductCategory } from '../../module.api';

export const PRODUCT_CATEGORY_COLUMNS: DataTableShellColumn<ProductCategory>[] = [
  {
    accessor: 'name',
    title: 'Category Name',
    key: 'name',
    sortable: true,
    width: 200,
  },
  {
    accessor: 'slug',
    title: 'Slug',
    key: 'slug',
    sortable: true,
    width: 180,
  },
  {
    accessor: 'description',
    title: 'Description',
    key: 'description',
    sortable: false,
    width: 300,
  },
  {
    accessor: 'parent',
    title: 'Parent Category',
    key: 'parent',
    sortable: true,
    width: 150,
    defaultVisible: true,
  },
  {
    accessor: 'createdAt',
    title: 'Created At',
    key: 'createdAt',
    sortable: true,
    width: 150,
    defaultVisible: false,
  },
];
