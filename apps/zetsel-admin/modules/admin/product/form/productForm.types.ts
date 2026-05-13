export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface ColorOption {
  name: string;
  hex: string;
}

export interface RatingBreakdownItem {
  category: string;
  value: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface ProductFormValues extends Record<string, unknown> {
  // Step 1 — Identity
  id: string;
  brand: string;
  brandLogo: string;
  shortName: string;
  fullName: string;
  breadcrumbs: BreadcrumbItem[];

  // Step 2 — Media
  images: string[];
  videoUrl: string;
  colorOptions: ColorOption[];

  // Step 3 — Pricing & Availability
  price: string;
  mrp: string;
  currency: string;
  inStock: boolean;
  freeShipping: boolean;
  vatInclusive: boolean;

  // Step 4 — Ratings & Audience
  rating: number;
  reviewCount: number;
  ratingAudience: string;
  ratingEmojis: string[];
  ratingBreakdown: RatingBreakdownItem[];

  // Step 5 — Specifications
  specHighlights: SpecItem[];
  specifications: SpecItem[];
}
