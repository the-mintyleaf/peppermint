"use client";

import { RequireCapability } from "@/components/RequireCapability";
import type { RequireDocumentAccessProps } from "./RequireDocumentAccess.types";

/**
 * Gate the generated-document stack on the `documents` capability — the right to
 * **read** a document.
 *
 * This gate used to mean "exactly `admin`", because the backend refused a Lead
 * Manager 403 on every route including `GET`. It no longer decides write rights at
 * all: a reader who may not edit is admitted here and sees a read-only editor, which
 * `documentWrite` governs. Do not put write checks back into this gate.
 *
 * `superadmin` is still refused outright. Whether a `lead_manager` is admitted is
 * `LEAD_MANAGER_DOCUMENT_READ_ENABLED` in `config/access/capabilities.ts` — currently
 * `false`, since the backend has not yet granted that read.
 */
export function RequireDocumentAccess({
  children,
}: RequireDocumentAccessProps) {
  return (
    <RequireCapability capability="documents">{children}</RequireCapability>
  );
}
