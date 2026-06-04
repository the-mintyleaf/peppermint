'use client';

import { ModalTableShell } from '@zetsel/admin';
import { fetchProductCategories, createProductCategory, updateProductCategory, deleteProductCategory } from '../../module.api';
import { PRODUCT_CATEGORY_COLUMNS } from './list.columns';
import { ProductCategoryForm } from '../../form/ProductCategoryForm';
import type { ProductCategory } from '../../module.api';

export function ProductCategoryList() {
  return (
    <ModalTableShell<ProductCategory>
      queryKey="product-categories.list"
      queryGetFn={(params) => fetchProductCategories(params)}
      dataKey="categories"
      paginationKey="meta"
      columns={PRODUCT_CATEGORY_COLUMNS}
      moduleInfo={{
        name: 'Product Category',
        label: 'Product Categories',
        description: 'Manage product categories',
      }}
      idAccessor="id"
      createFormComponent={ProductCategoryForm}
      editFormComponent={ProductCategoryForm}
      onCreateApi={(values) => createProductCategory(values as Partial<ProductCategory>)}
      onEditApi={(values, record) => updateProductCategory(record.id, values as Partial<ProductCategory>)}
      onDeleteApi={(id) => deleteProductCategory(String(id))}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
      tabs={[
        { label: 'All Categories' },
      ]}
    />
  );
}
