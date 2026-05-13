"use client";

import { ProductForm } from "../../form";

export function ProductsNew() {
  return <ProductForm onBack={() => history.back()} />;
}
