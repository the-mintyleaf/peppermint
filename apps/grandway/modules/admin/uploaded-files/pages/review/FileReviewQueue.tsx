"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
import { VerifyFileModal } from "../../_shared/components/VerifyFileModal";
import { listFiles } from "../../uploadedFiles.api";
import { fileQueryKeys } from "../../uploadedFiles.queryKeys";
import type { UploadedFile } from "../../uploadedFiles.types";
import { getFileReviewColumns } from "./fileReview.columns";

function FileReviewQueueContent() {
  const router = useRouter();
  const [verifyFor, setVerifyFor] = useState<UploadedFile | null>(null);

  const columns = getFileReviewColumns({
    onViewDetails: (file) => router.push(`/admin/files/${file.id}`),
    onVerify: setVerifyFor,
  });

  return (
    <>
      <DataTableShell<UploadedFile>
        queryKey={fileQueryKeys.lists()}
        queryGetFn={listFiles}
        dataKey="data"
        paginationKey="meta"
        enableServerQuery
        columns={columns}
        moduleInfo={{
          name: "file-review",
          label: "File review queue",
          description:
            "Files awaiting verification, across every applicant and journey",
        }}
        forceFilters={{ verification_status: "pending" }}
        disableCreateButton
        pageSizes={[10, 20, 50, 100]}
        defaultPageSize={20}
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      {verifyFor ? (
        <VerifyFileModal
          file={verifyFor}
          opened={verifyFor !== null}
          onClose={() => setVerifyFor(null)}
        />
      ) : null}
    </>
  );
}

/**
 * Verify/archive/restore are Admin only (§1) — `RequireDocumentAccess` is
 * reused here for its exact-`admin` gate (identical check to what a
 * dedicated "review-only" guard would do); its doc-comment describes the
 * document stack specifically, but the gate logic itself — authorityType ===
 * "admin", nothing else — is exactly this queue's access rule too, and the
 * task's own spec calls for reusing it rather than adding a new guard.
 */
export function ModuleFileReviewQueue() {
  return (
    <RequireDocumentAccess>
      <FileReviewQueueContent />
    </RequireDocumentAccess>
  );
}
