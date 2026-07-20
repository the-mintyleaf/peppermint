"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Alert,
  Text,
  Tooltip,
  modals,
  notifications,
  useQueryClient,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";

import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { ApplicantActionTarget } from "../../../_shared";
import { WarningIcon } from "@phosphor-icons/react/dist/ssr";

/**
 * Opens the applicant's document workspace from the list. Checks whether the applicant has
 * any documents first (through React Query, so the editor reuses the same cached list on
 * arrival). When none exist, it confirms before sending the operator to the editor's
 * create flow — so they never land on an empty workspace unexpectedly.
 */
export function OpenDocumentButton({
  applicant,
}: {
  applicant: ApplicantActionTarget;
}) {
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
        title: "DOCUMENT NOT FOUND",
        children: (
          <Alert icon={<WarningIcon />}>
            <Text size="xs">
              {applicant.full_name} has no documents yet. <br />
              Create a <b>New Document</b> one now?
            </Text>
          </Alert>
        ),
        labels: { confirm: "Create document", cancel: "Cancel" },
        confirmProps: { size: "xs" },
        cancelProps: { size: "xs" },
        onConfirm: goToEditor,
        styles: {
          title: {
            fontSize: "var(--mantine-font-size-sm)",
          },
          inner: {
            padding: "var(--mantine-spacing-xs)",
          },
        },
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
