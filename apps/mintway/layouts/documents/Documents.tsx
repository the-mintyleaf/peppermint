import type { ReactNode } from "react";
import { Box } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";

/**
 * Shell for the full-screen document generator (`/documents/*`). Deliberately outside the
 * admin layout — no sidebar chrome — but still gated behind an authenticated account
 * (documents are admin/superadmin-only server-side, which returns 404 to staff). A surface
 * background keeps the pages readable over the app's gradient body.
 */
export function LayoutDocuments({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <Box
        style={{
          minHeight: "100vh",
          background: "var(--mantine-color-body)",
        }}
      >
        {children}
      </Box>
    </RequireAuth>
  );
}
