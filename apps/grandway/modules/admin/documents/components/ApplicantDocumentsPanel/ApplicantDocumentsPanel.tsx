"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  Group,
  Loader,
  Stack,
  Text,
  useQuery,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { documentsApi } from "@/modules/documents";
import { workspaceEditorHref } from "../../documents.queries";
import { FAMILY_COLORS, FAMILY_LABELS } from "../../documents.labels";
import type { ApplicantDocumentsPanelProps } from "./ApplicantDocumentsPanel.types";

const MAX_PREVIEW = 5;

/**
 * Applicant-detail panel linking into that applicant's document workspace. Documents are
 * Admin-only, reads included (`documents/docs/SECURITY.md`) — for a lead manager or
 * superadmin the panel renders **nothing** (never an empty shell, which would itself leak
 * that documents may exist). Uses a panel-local query key so it never collides with the
 * editor provider's full-document cache under `documentQueryKeys.list`.
 */
export function ApplicantDocumentsPanel({
  applicantId,
  applicantName,
}: ApplicantDocumentsPanelProps) {
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";

  const query = useQuery({
    queryKey: ["documents", "applicant-panel", applicantId],
    queryFn: () => documentsApi.listByApplicant(applicantId),
    enabled: isAdmin,
  });

  if (!isAdmin) return null;

  const documents = query.data ?? [];
  const preview = documents.slice(0, MAX_PREVIEW);
  const overflow = documents.length - preview.length;

  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <FileTextIcon size={16} aria-hidden />
          <Text fw={600} size="sm">
            Documents
          </Text>
          {!query.isLoading ? (
            <Badge size="sm" variant="light">
              {documents.length}
            </Badge>
          ) : null}
        </Group>
        <Button
          component={Link}
          href={workspaceEditorHref(applicantId)}
          size="compact-xs"
          variant="light"
          rightSection={<ArrowRightIcon size={12} aria-hidden />}
          aria-label={`Open ${applicantName ?? "applicant"}'s document workspace`}
        >
          Open workspace
        </Button>
      </Group>

      {query.isLoading ? (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      ) : query.isError ? (
        <Text size="xs" c="red">
          Couldn&apos;t load documents.
        </Text>
      ) : documents.length === 0 ? (
        <Text size="xs" c="dimmed">
          No documents yet. Open the workspace to create the first one.
        </Text>
      ) : (
        <Stack gap={6}>
          {preview.map((doc) => (
            <Group key={doc.id} justify="space-between" wrap="nowrap">
              <Text size="xs" lineClamp={1}>
                {doc.label}
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={FAMILY_COLORS[doc.family]}
              >
                {FAMILY_LABELS[doc.family]}
              </Badge>
            </Group>
          ))}
          {overflow > 0 ? (
            <Text size="xs" c="dimmed">
              +{overflow} more
            </Text>
          ) : null}
        </Stack>
      )}
    </Card>
  );
}
