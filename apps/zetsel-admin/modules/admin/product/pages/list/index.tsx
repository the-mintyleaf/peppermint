"use client";

import { Avatar } from "@zetsel/ui";
import { DataTableShell } from "@zetsel/admin";
import { fetchProducts } from "../../module.api";
import { PRODUCT_COLUMNS } from "./list.columns";
import type { Product } from "../../module.api";

const COLUMNS = PRODUCT_COLUMNS.map((col) =>
  col.key === "thumbnail"
    ? {
        ...col,
        render: (row: Product) => (
          <Avatar src={row.thumbnail} alt={row.title} size={32} radius="sm" />
        ),
      }
    : col,
);

const STATUS_TABS = [
  { label: "All Products" },
  {
    label: "In Stock",
    forceFilter: (rows: Product[]) =>
      rows.filter((r) => r.availabilityStatus === "In Stock"),
  },
  {
    label: "Low Stock",
    forceFilter: (rows: Product[]) =>
      rows.filter((r) => r.availabilityStatus === "Low Stock"),
  },
  {
    label: "Out of Stock",
    forceFilter: (rows: Product[]) =>
      rows.filter((r) => r.availabilityStatus === "Out of Stock"),
  },
];

export function ProductsList() {
  return (
    <DataTableShell<Product>
      queryKey="products.list"
      queryGetFn={(params) => fetchProducts(params)}
      dataKey="products"
      paginationKey="meta"
      enableServerQuery
      columns={COLUMNS}
      moduleInfo={{
        name: "Product",
        label: "Products",
        description: "Manage your product catalogue",
      }}
      basePath="/admin/product-management/products"
      tabs={STATUS_TABS}
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
    />
  );
}
