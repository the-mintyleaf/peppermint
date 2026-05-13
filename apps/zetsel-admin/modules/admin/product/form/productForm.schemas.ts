import { z } from "zod";

// Step 1 — Identity (kept separate for reuse/testing)
export const identitySchema = z.object({
  id: z.string().min(1, "ID is required").regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only"),
  brand: z.string().min(1, "Brand is required"),
  brandLogo: z.string().url("Must be a valid URL"),
  shortName: z.string().min(1, "Short name is required"),
  fullName: z.string().min(10, "Full name must be at least 10 characters"),
  breadcrumbs: z
    .array(z.object({ label: z.string().min(1, "Label required"), href: z.string().min(1, "Href required") }))
    .min(1, "At least one breadcrumb is required"),
});

// Step 2 — Media (kept separate for reuse/testing)
export const mediaSchema = z.object({
  images: z.array(z.string().url("Each image must be a valid URL")).min(1, "At least one image is required"),
  videoUrl: z.string(),
  colorOptions: z.array(
    z.object({
      name: z.string().min(1, "Color name required"),
      hex: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Must be a valid hex color"),
    })
  ),
});

// Steps 1+2 merged — validates all identity and media fields together
export const identityMediaSchema = identitySchema.merge(mediaSchema);

// Step 3 — Pricing & Availability
export const pricingSchema = z.object({
  price: z.string().min(1, "Price is required"),
  mrp: z.string().min(1, "MRP is required"),
  currency: z.string().min(1, "Currency symbol is required"),
  inStock: z.boolean(),
  freeShipping: z.boolean(),
  vatInclusive: z.boolean(),
});

// Step 4 — Ratings & Audience
export const ratingsSchema = z.object({
  rating: z.number().min(0).max(5),
  reviewCount: z.number().min(0),
  ratingAudience: z.string(),
  ratingEmojis: z.array(z.string()),
  ratingBreakdown: z.array(
    z.object({
      category: z.string().min(1, "Category required"),
      value: z.number().min(0).max(5),
    })
  ),
});

// Step 5 — Specifications
export const specificationsSchema = z.object({
  specHighlights: z
    .array(z.object({ label: z.string().min(1, "Label required"), value: z.string().min(1, "Value required") }))
    .min(1, "At least one spec highlight is required"),
  specifications: z
    .array(z.object({ label: z.string().min(1, "Label required"), value: z.string().min(1, "Value required") }))
    .min(1, "At least one full specification is required"),
});

export const PRODUCT_STEP_FIELDS: string[][] = [
  // Step 1 — Identity + Media combined
  ["id", "brand", "brandLogo", "shortName", "fullName", "breadcrumbs", "images", "videoUrl", "colorOptions"],
  // Step 2
  ["price", "mrp", "currency", "inStock", "freeShipping", "vatInclusive"],
  // Step 3
  ["rating", "reviewCount", "ratingAudience", "ratingEmojis", "ratingBreakdown"],
  // Step 4
  ["specHighlights", "specifications"],
];
