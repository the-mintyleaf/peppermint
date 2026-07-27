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
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import { workspaceEditorHref } from "@/modules/admin/documents/documents.queries";
import { applicantDisplayName } from "../../../../applicants.labels";
import type { OpenDocumentButtonProps } from "./OpenDocumentButton.types";

/**
 * List-row quick entry into an applicant's document workspace. Checks whether the
 * applicant has any documents first (through React Query, so the editor reuses the same
 * cached list on arrival under `documentQueryKeys.list`). When none exist, it confirms
 * before sending the operator to the editor's create flow — so they never land on an
 * empty workspace unexpectedly.
 *
 * Admin-only including the affordance itself: documents answer non-admins with 404, not
 * 403, so staff can't infer a document exists — rendering the button would both leak the
 * affordance and fire a request that can only fail (`documents/docs/SECURITY.md`).
 */
export function OpenDocumentButton({ applicant }: OpenDocumentButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { authorityType } = useCurrentUser();
  const [isChecking, setChecking] = useState(false);

  const displayName = applicantDisplayName(applicant);

  const goToEditor = () => router.push(workspaceEditorHref(applicant.id));

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
        title: "No documents yet",
        children: (
          <Alert icon={<WarningIcon size={16} aria-hidden />} color="yellow">
            <Text size="xs">
              {displayName} has no documents yet. Create a new one now?
            </Text>
          </Alert>
        ),
        labels: { confirm: "Create document", cancel: "Cancel" },
        confirmProps: { size: "xs" },
        cancelProps: { size: "xs" },
        onConfirm: goToEditor,
        styles: {
          title: { fontSize: "var(--mantine-font-size-sm)" },
          inner: { padding: "var(--mantine-spacing-xs)" },
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

  if (authorityType !== "admin") return null;

  return (
    <Tooltip label="Open document" withArrow>
      <ActionIcon
        variant="subtle"
        size="sm"
        color="gray"
        aria-label={`Open document for ${displayName}`}
        loading={isChecking}
        onClick={handleClick}
      >
        <FileTextIcon size={16} aria-hidden />
      </ActionIcon>
    </Tooltip>
  );
}
