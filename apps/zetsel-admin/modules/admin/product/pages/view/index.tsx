"use client";

import { ProductView } from "./ProductView";
import { useParams } from "next/navigation";

export function ProductsView() {
  const params = useParams();
  const productId = params.id as string;

  return <ProductView productId={productId} />;
}
