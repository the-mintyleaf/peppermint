"use client";

import { useState } from "react";
import {
  Accordion,
  Badge,
  Drawer,
  Group,
  Loader,
  Stack,
  Text,
  dayjs,
  useQuery,
} from "@peppermint/ui";
import { documentsApi, documentQueryKeys } from "@/modules/documents";
import type { DocumentStatus } from "@/modules/documents";
import { QueryErrorState } from "@/components/QueryErrorState";
import { DocumentRevisionsPrintsPanel } from "./DocumentRevisionsPrintsPanel";
import type { DocumentWorkspaceDrawerProps } from "./DocumentWorkspaceDrawer.types";

const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: "gray",
  ready: "cyan",
  finalized: "blue",
  submitted: "green",
  superseded: "orange",
  archived: "dark",
};

/**
 * Read-only inspector for one applicant's document workspace: an accordion of the applicant's
 * documents; expanding a row lazily loads that document's revisions & print events.
 */
export function DocumentWorkspaceDrawer({
  workspace,
  opened,
  onClose,
}: DocumentWorkspaceDrawerProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const applicantId = workspace?.applicantId ?? null;

  const {
    data: documents,
    isLoading,
    isError,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: documentQueryKeys.list(applicantId ?? ""),
    queryFn: () => documentsApi.listByApplicant(applicantId as string),
    enabled: opened && Boolean(applicantId),
  });

  const title = workspace
    ? [workspace.applicantName, workspace.applicantCode]
        .filter(Boolean)
        .join(" · ") || "Documents"
    : "Documents";

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      title={title}
    >
      {isLoading ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : isError ? (
        <QueryErrorState
          message="Couldn't load documents."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : !documents || documents.length === 0 ? (
        <Text size="xs" c="dimmed">
          No documents in this workspace.
        </Text>
      ) : (
        <Accordion
          variant="separated"
          value={openItem}
          onChange={setOpenItem}
          chevronPosition="right"
        >
          {documents.map((doc) => (
            <Accordion.Item key={doc.id} value={doc.id}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" gap="sm" pr="sm">
                  <Stack gap={2}>
                    <Text size="xs" fw={500}>
                      {doc.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Updated {dayjs(doc.updatedAt).fromNow()}
                    </Text>
                  </Stack>
                  <Badge
                    size="sm"
                    variant="light"
                    color={STATUS_COLORS[doc.status]}
                  >
                    {doc.status}
                  </Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <DocumentRevisionsPrintsPanel
                  documentId={doc.id}
                  enabled={openItem === doc.id}
                />
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      )}
    </Drawer>
  );
}
