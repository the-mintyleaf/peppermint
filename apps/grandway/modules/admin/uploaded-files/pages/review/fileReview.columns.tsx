"use client";

import { dateColumn, rowActionsColumn, statusColumn } from "@peppermint/admin";
import type { DataTableShellColumn } from "@peppermint/admin";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { Text } from "@peppermint/ui";
import {
  FILE_CATEGORY_LABELS,
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../uploadedFiles.labels";
import type { UploadedFile } from "../../uploadedFiles.types";

interface FileReviewColumnsOptions {
  onViewDetails: (file: UploadedFile) => void;
  onVerify: (file: UploadedFile) => void;
}

/**
 * `?verification_status=pending` queue, Admin only (§CONCEPT/§FLOWS). Category
 * needs a `render` to map the enum to its label; every other column is plain
 * text or a shared column factory.
 */
export function getFileReviewColumns({
  onViewDetails,
  onVerify,
}: FileReviewColumnsOptions): DataTableShellColumn<UploadedFile>[] {
  return [
    {
      accessor: "original_filename",
      title: "File",
      icon: FileTextIcon,
    },
    {
      accessor: "category",
      title: "Category",
      icon: TagIcon,
      render: (file) => (
        <Text size="xs">{FILE_CATEGORY_LABELS[file.category]}</Text>
      ),
    },
    {
      accessor: "uploaded_by_username",
      title: "Uploaded by",
      icon: UserIcon,
    },
    dateColumn<UploadedFile>("created_at", {
      title: "Uploaded",
      icon: CalendarBlankIcon,
      format: "MMM D, YYYY h:mm A",
    }),
    statusColumn<UploadedFile, UploadedFile["verification_status"]>(
      "verification_status",
      {
        title: "Status",
        icon: CheckCircleIcon,
        colorMap: VERIFICATION_STATUS_COLORS,
        labelMap: VERIFICATION_STATUS_LABELS,
      },
    ),
    rowActionsColumn<UploadedFile>({
      actions: [
        {
          label: "Review",
          icon: <CheckCircleIcon size={16} aria-hidden />,
          onClick: onVerify,
        },
        {
          label: "View detail",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onViewDetails,
        },
      ],
    }),
  ];
}
