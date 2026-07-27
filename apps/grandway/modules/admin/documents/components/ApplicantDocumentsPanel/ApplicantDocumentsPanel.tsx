"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  dayjs,
  useQuery,
} from "@peppermint/ui";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import {
  ProfileList,
  ProfileListRow,
  ProfilePanelHeader,
} from "@/components/profile";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { documentsApi } from "@/modules/documents";
import { workspaceEditorHref } from "../../documents.queries";
import {
  FAMILY_COLORS,
  FAMILY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "../../documents.labels";
import type { ApplicantDocumentsPanelProps } from "./ApplicantDocumentsPanel.types";

/**
 * Applicant-detail panel listing that applicant's documents and opening the
 * editor on them. Documents are Admin-only, reads included
 * (`documents/docs/SECURITY.md`) — for a lead manager or superadmin the panel
 * renders **nothing** (never an empty shell, which would itself leak that
 * documents may exist). Uses a panel-local query key so it never collides with
 * the editor provider's full-document cache under `documentQueryKeys.list`.
 *
 * Every applicant-owned document opens the same workspace route, so the row
 * link and the header button lead to the same place — the row is the shortcut
 * for when you already know which document you want. Search replaced the old
 * five-row cap: truncating a list with no way to reach the rest is a dead end.
 */
export function ApplicantDocumentsPanel({
  applicantId,
  applicantName,
}: ApplicantDocumentsPanelProps) {
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["documents", "applicant-panel", applicantId],
    queryFn: () => documentsApi.listByApplicant(applicantId),
    enabled: isAdmin,
  });

  const documents = useMemo(() => query.data ?? [], [query.data]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter(
      (doc) =>
        doc.label.toLowerCase().includes(q) ||
        FAMILY_LABELS[doc.family].toLowerCase().includes(q),
    );
  }, [documents, search]);

  const editorHref = workspaceEditorHref(applicantId);

  if (!isAdmin) return null;

  return (
    <Stack gap="md">
      <ProfilePanelHeader
        title="Documents"
        description="Generated paperwork for this applicant"
        count={query.isLoading ? undefined : documents.length}
        action={
          <>
            {documents.length > 0 ? (
              <TextInput
                size="xs"
                placeholder="Search documents"
                aria-label="Search documents"
                leftSection={<MagnifyingGlassIcon size={14} aria-hidden />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />
            ) : null}
            <Button
              component={Link}
              href={editorHref}
              size="xs"
              rightSection={<ArrowRightIcon size={14} aria-hidden />}
              aria-label={`Open the document editor for ${applicantName ?? "this applicant"}`}
            >
              Open document editor
            </Button>
          </>
        }
      />

      {query.isLoading ? (
        <Center py="md">
          <Loader size="sm" />
        </Center>
      ) : query.isError ? (
        <Stack align="center" gap="xs" py="md">
          <Text size="xs" c="dimmed">
            Couldn&apos;t load documents.
          </Text>
          <Button size="xs" variant="default" onClick={() => query.refetch()}>
            Try again
          </Button>
        </Stack>
      ) : documents.length === 0 ? (
        <Text size="xs" c="dimmed">
          No documents yet — open the editor to create the first one.
        </Text>
      ) : filtered.length === 0 ? (
        <Text size="xs" c="dimmed">
          No documents match &ldquo;{search}&rdquo;.
        </Text>
      ) : (
        <ProfileList>
          {filtered.map((doc) => (
            <ProfileListRow key={doc.id} href={editorHref}>
              <Group
                justify="space-between"
                align="flex-start"
                wrap="nowrap"
                gap="md"
              >
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} lineClamp={1}>
                    {doc.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Updated {dayjs(doc.updatedAt).format("MMM D, YYYY")}
                  </Text>
                </Stack>
                <Group gap={4} wrap="nowrap">
                  {doc.isArchived ? (
                    <Badge size="xs" variant="outline" color="gray">
                      Archived
                    </Badge>
                  ) : null}
                  <Badge
                    size="xs"
                    variant="light"
                    color={STATUS_COLORS[doc.status]}
                  >
                    {STATUS_LABELS[doc.status]}
                  </Badge>
                  <Badge
                    size="xs"
                    variant="light"
                    color={FAMILY_COLORS[doc.family]}
                  >
                    {FAMILY_LABELS[doc.family]}
                  </Badge>
                </Group>
              </Group>
            </ProfileListRow>
          ))}
        </ProfileList>
      )}
    </Stack>
  );
}
