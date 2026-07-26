"use client";

import type { ReactNode } from "react";
import { Box } from "@peppermint/ui";

/**
 * Shell for the full-screen document editor/viewer (`/documents/workspace/[applicantId]`
 * and `/documents/standalone/[documentId]`). Deliberately **outside** the admin layout —
 * no sidebar/nav chrome, so the editor's resizable panels and print surface own the whole
 * viewport. The Documents worklists still live inside the admin shell
 * (`/admin/documents`); only the editor lives here.
 *
 * No auth gate here: `DocumentEditor` self-wraps `RequireDocumentAccess` (admin-only,
 * reads included — `documents/docs/SECURITY.md`), which also covers the unverifiable-
 * session case. An opaque surface background keeps the page readable over the app's dark
 * gradient body.
 */
export function LayoutDocuments({ children }: { children: ReactNode }) {
  return (
    <Box
      style={{
        minHeight: "100vh",
        background: "var(--mantine-color-body)",
      }}
    >
      {children}
    </Box>
  );
}
