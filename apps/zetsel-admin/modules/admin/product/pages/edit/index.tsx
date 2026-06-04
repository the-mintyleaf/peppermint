"use client";

import { ProductForm } from "../../form";

export function ProductsEdit() {
  return <ProductForm onBack={() => history.back()} />;
}
