import type { ReactNode } from "react";
import { Box } from "@peppermint/ui";
import { RequireAuth } from "@/components/RequireAuth";
import { RequireDocumentAccess } from "@/modules/documents/components/RequireDocumentAccess";

/**
 * Shell for the full-screen document editor (`/documents/[applicantId]`). Deliberately outside
 * the admin layout — no sidebar chrome, so the editor's resizable panels/print surface own the
 * viewport. The Documents list and Signatures manager now live inside the admin shell
 * (`/admin/documents`, `/admin/signatures`); only the editor stays here.
 *
 * Two gates, in order: `RequireAuth` (signed in at all) then `RequireDocumentAccess` (documents
 * are admin/superadmin-only). The second matters — without it a staff account reached a rendered
 * editor whose every request 404s, which is both a broken screen and a disclosure the contract
 * avoids. `RequireDocumentAccess` shows the app's not-found treatment instead, matching what the
 * server would say. A surface background keeps the page readable over the app's gradient body.
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
        <RequireDocumentAccess>{children}</RequireDocumentAccess>
      </Box>
    </RequireAuth>
  );
}
