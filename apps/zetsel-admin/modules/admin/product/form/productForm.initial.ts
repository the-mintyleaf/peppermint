import type { ProductFormValues } from "./productForm.types";

export const PRODUCT_FORM_INITIAL: ProductFormValues = {
  id: "",
  brand: "",
  brandLogo: "",
  shortName: "",
  fullName: "",
  breadcrumbs: [{ label: "", href: "#" }],

  images: [""],
  videoUrl: "",
  colorOptions: [],

  price: "",
  mrp: "",
  currency: "रु",
  inStock: true,
  freeShipping: false,
  vatInclusive: true,

  rating: 0,
  reviewCount: 0,
  ratingAudience: "",
  ratingEmojis: [],
  ratingBreakdown: [
    { category: "General Use", value: 3 },
    { category: "Gaming", value: 3 },
    { category: "Development", value: 3 },
  ],

  specHighlights: [{ label: "", value: "" }],
  specifications: [{ label: "", value: "" }],
};
