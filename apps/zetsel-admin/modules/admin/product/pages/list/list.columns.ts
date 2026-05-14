import type { DataTableShellColumn } from '@zetsel/admin';
import type { Product } from '../../module.api';

export const PRODUCT_COLUMNS: DataTableShellColumn<Product>[] = [
  {
    accessor: 'thumbnail',
    title: '',
    key: 'thumbnail',
    width: 52,
    sortable: false,
  },
  {
    accessor: 'title',
    title: 'Product',
    key: 'title',
    sortable: true,
    width: 260,
  },
  {
    accessor: 'brand',
    title: 'Brand',
    key: 'brand',
    sortable: true,
    width: 140,
  },
  {
    accessor: 'category',
    title: 'Category',
    key: 'category',
    sortable: true,
    width: 140,
  },
  {
    accessor: 'price',
    title: 'Price',
    key: 'price',
    sortable: true,
    width: 100,
    render: (row) => `$${row.price.toFixed(2)}`,
  },
  {
    accessor: 'stock',
    title: 'Stock',
    key: 'stock',
    sortable: true,
    width: 90,
  },
  {
    accessor: 'rating',
    title: 'Rating',
    key: 'rating',
    sortable: true,
    width: 90,
    render: (row) => `${row.rating.toFixed(1)} ★`,
  },
  {
    accessor: 'availabilityStatus',
    title: 'Status',
    key: 'status',
    width: 130,
  },
  {
    accessor: 'sku',
    title: 'SKU',
    key: 'sku',
    width: 130,
    defaultVisible: false,
  },
  {
    accessor: 'discountPercentage',
    title: 'Discount',
    key: 'discount',
    width: 100,
    defaultVisible: false,
    render: (row) => `${row.discountPercentage.toFixed(1)}%`,
  },
];
