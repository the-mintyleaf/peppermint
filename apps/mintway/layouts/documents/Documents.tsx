import type { ReactNode } from "react";
import { Box } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";

/**
 * Shell for the full-screen document editor (`/documents/[applicantId]`). Deliberately outside
 * the admin layout — no sidebar chrome, so the editor's resizable panels/print surface own the
 * viewport — but still gated behind an authenticated account (documents are admin/superadmin-only
 * server-side, which returns 404 to staff). The Documents list and Signatures manager now live
 * inside the admin shell (`/admin/documents`, `/admin/signatures`); only the editor stays here.
 * A surface background keeps the page readable over the app's gradient body.
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
