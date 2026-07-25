"use client";

import { useRouter } from "next/navigation";
import { RowActionsMenu } from "@peppermint/admin";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowsClockwise";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { downloadFile } from "../../downloadFile";
import {
  openArchiveFileModal,
  openRestoreFileModal,
} from "../../fileLifecycleModals";
import { useArchiveFile, useRestoreFile } from "../../../uploadedFiles.hooks";
import type { UploadedFile } from "../../../uploadedFiles.types";
import type { FileRowActionsMenuProps } from "./FileRowActionsMenu.types";

/**
 * Per-file menu for `FilesPanel`'s cards. "Download" and "View detail" are
 * always available (reads are shared with lead managers, §1). "Replace" is
 * hidden once superseded or archived (`UPLOADED_FILES_ALREADY_SUPERSEDED` /
 * `UPLOADED_FILES_FILE_ARCHIVED`). Verify/Archive/Restore are gated on the
 * exact `admin` tier — a lead manager gets `UPLOADED_FILES_ACTOR_FORBIDDEN`
 * server-side, so the controls are hidden rather than shown and failed
 * (mirrors `ClientRowActionsMenu`'s `isAdmin` check, not `useCurrentUser`'s
 * broader `isAdmin` which also covers superadmin).
 */
export function FileRowActionsMenu({
  file,
  onReplace,
  onEdit,
  onVerify,
}: FileRowActionsMenuProps) {
  const router = useRouter();
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const archiveMutation = useArchiveFile(file.id);
  const restoreMutation = useRestoreFile(file.id);

  return (
    <RowActionsMenu<UploadedFile>
      record={file}
      aria-label={`Actions for ${file.original_filename}`}
      actions={[
        {
          label: "Download",
          icon: <DownloadSimpleIcon size={16} aria-hidden />,
          onClick: (record) =>
            downloadFile(record.id, record.original_filename),
        },
        {
          label: "View detail",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: (record) => router.push(`/admin/files/${record.id}`),
        },
        {
          label: "Replace",
          icon: <ArrowsClockwiseIcon size={16} aria-hidden />,
          dividerBefore: true,
          hidden: (record) => record.is_archived || !record.is_current,
          onClick: onReplace,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          hidden: (record) => record.is_archived,
          onClick: onEdit,
        },
        {
          label: "Verify",
          icon: <CheckCircleIcon size={16} aria-hidden />,
          dividerBefore: true,
          hidden: (record) => !isAdmin || record.is_archived,
          onClick: onVerify,
        },
        {
          label: "Archive",
          icon: <ProhibitIcon size={16} aria-hidden />,
          color: "red",
          hidden: (record) => !isAdmin || record.is_archived,
          onClick: (record) =>
            openArchiveFileModal(record, async (reason) => {
              await archiveMutation.mutateAsync({ reason });
            }),
        },
        {
          label: "Restore",
          icon: <ArrowCounterClockwiseIcon size={16} aria-hidden />,
          color: "teal",
          hidden: (record) => !isAdmin || !record.is_archived,
          onClick: (record) =>
            openRestoreFileModal(record, async (note) => {
              await restoreMutation.mutateAsync(note ? { note } : {});
            }),
        },
      ]}
    />
  );
}
