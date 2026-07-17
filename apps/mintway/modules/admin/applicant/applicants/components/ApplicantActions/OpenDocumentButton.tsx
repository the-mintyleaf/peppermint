"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Text,
  Tooltip,
  modals,
  notifications,
  useQueryClient,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";

import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { Applicant } from "../../../_shared";

/**
 * Opens the applicant's document workspace from the list. Checks whether the applicant has
 * any documents first (through React Query, so the editor reuses the same cached list on
 * arrival). When none exist, it confirms before sending the operator to the editor's
 * create flow — so they never land on an empty workspace unexpectedly.
 */
export function OpenDocumentButton({ applicant }: { applicant: Applicant }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isChecking, setChecking] = useState(false);

  const goToEditor = () => router.push(`/documents/${applicant.id}`);

  const handleClick = async () => {
    setChecking(true);
    try {
      const documents = await queryClient.fetchQuery({
        queryKey: documentQueryKeys.list(applicant.id),
        queryFn: () => documentsApi.listByApplicant(applicant.id),
      });

      if (documents.length > 0) {
        goToEditor();
        return;
      }

      modals.openConfirmModal({
        title: "No document yet",
        children: (
          <Text size="sm">
            {applicant.full_name} has no documents yet. Create one now?
          </Text>
        ),
        labels: { confirm: "Create document", cancel: "Cancel" },
        confirmProps: { size: "xs" },
        cancelProps: { size: "xs" },
        onConfirm: goToEditor,
      });
    } catch {
      notifications.show({
        title: "Couldn't open document",
        message: "Please try again.",
        color: "red",
      });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Tooltip label="Open document" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        color="gray"
        aria-label={`Open document for ${applicant.full_name}`}
        loading={isChecking}
        onClick={handleClick}
      >
        <FileTextIcon size={16} />
      </ActionIcon>
    </Tooltip>
  );
}
