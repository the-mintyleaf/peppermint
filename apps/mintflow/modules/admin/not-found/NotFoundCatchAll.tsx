import { notFound } from "next/navigation";

// Catch-all trigger for unmatched `/admin/*` URLs. Next.js only routes
// unmatched paths to the closest `not-found.tsx` boundary when a rendered
// segment throws `notFound()` — this segment does exactly that, which surfaces
// `app/admin/not-found.tsx` (ModuleNotFound) inside the admin layout.
export function AdminCatchAll() {
  notFound();
}
