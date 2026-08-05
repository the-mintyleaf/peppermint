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
import { useCapabilities } from "@/config/access";
import {
  canSeeFamily,
  documentsApi,
  documentsByApplicantKey,
} from "@/modules/documents";
import { workspaceEditorHref } from "@/modules/admin/documents/documents.queries";
import { applicantDisplayName } from "../../../../applicants.labels";
import type { OpenDocumentButtonProps } from "./OpenDocumentButton.types";

/**
 * List-row quick entry into an applicant's document workspace. Checks whether the
 * applicant has any documents first, sharing `documentsByApplicantKey` with the
 * applicant detail's Documents panel — same request, same shape, so either warms the
 * other. (It previously read `documentQueryKeys.list(applicant.id)`, a key nothing
 * else wrote and whose sibling holds a different payload entirely, so the check never
 * hit a warm cache.) When none exist, it confirms before sending the operator to the
 * editor's create flow, so they never land on an empty workspace unexpectedly.
 *
 * Gated on the right to READ a document, affordance included: documents answer a
 * refused role with 404, not 403, so rendering the button would both leak the
 * affordance and fire a request that can only fail (`documents/INTEGRATION.md` §1).
 * The existence check counts only families the viewer may see — otherwise an
 * applicant holding nothing but bank documents would send them to a workspace that
 * then reports itself empty.
 */
export function OpenDocumentButton({ applicant }: OpenDocumentButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const capabilities = useCapabilities();
  const { documents: canReadDocuments, documentBankFamilies } = capabilities;
  const [isChecking, setChecking] = useState(false);

  const displayName = applicantDisplayName(applicant);

  const goToEditor = () => router.push(workspaceEditorHref(applicant.id));

  const handleClick = async () => {
    setChecking(true);
    try {
      const documents = await queryClient.fetchQuery({
        queryKey: documentsByApplicantKey(applicant.id, {
          bankFamilies: documentBankFamilies,
        }),
        queryFn: () => documentsApi.listByApplicant(applicant.id),
      });

      const visible = documents.filter((doc) =>
        canSeeFamily(capabilities, doc.family),
      );

      if (visible.length > 0) {
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

  if (!canReadDocuments) return null;

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
