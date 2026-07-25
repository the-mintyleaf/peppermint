"use client";

import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { DownloadSimpleIcon } from "@phosphor-icons/react/dist/csr/DownloadSimple";
import { QueryErrorState } from "@/components/QueryErrorState";
import { downloadFile } from "../../../_shared/downloadFile";
import { useFileVersions } from "../../../uploadedFiles.hooks";
import {
  VERIFICATION_STATUS_COLORS,
  VERIFICATION_STATUS_LABELS,
} from "../../../uploadedFiles.labels";
import { formatDateTime } from "../../../uploadedFiles.utils";

/**
 * Oldest first — deliberately the opposite of every files list, because a
 * chain reads as a history (§3). Works from any member of the chain,
 * including a superseded one; `meta.count` is the chain length, unpaginated.
 * A chain of one is normal, not an empty state.
 */
export function FileVersionHistoryPanel({ fileId }: { fileId: string }) {
  const { data, isLoading, isError, isRefetching, refetch } =
    useFileVersions(fileId);
  const versions = data?.data ?? [];

  if (isLoading) return <Loader size="sm" />;

  if (isError) {
    return (
      <QueryErrorState
        message="Couldn't load version history."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
      />
    );
  }

  return (
    <Stack gap="xs">
      {versions.map((version) => (
        <Paper key={version.id} withBorder p="sm" radius="sm">
          <Group justify="space-between" align="center" wrap="nowrap">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Group gap="xs">
                <Text size="xs" fw={500}>
                  v{version.version_number}
                </Text>
                <Badge
                  size="xs"
                  color={
                    VERIFICATION_STATUS_COLORS[version.verification_status]
                  }
                >
                  {VERIFICATION_STATUS_LABELS[version.verification_status]}
                </Badge>
                {version.id === fileId ? (
                  <Badge size="xs" variant="outline">
                    Viewing
                  </Badge>
                ) : null}
                {!version.is_current ? (
                  <Badge size="xs" color="gray" variant="outline">
                    Superseded
                  </Badge>
                ) : null}
                {version.is_archived ? (
                  <Badge size="xs" color="gray" variant="outline">
                    Archived
                  </Badge>
                ) : null}
              </Group>
              <Text size="xs" c="dimmed">
                {version.uploaded_by_username} ·{" "}
                {formatDateTime(version.created_at)}
              </Text>
            </Stack>
            <Group gap="xs" wrap="nowrap">
              {version.id !== fileId ? (
                <Text
                  size="xs"
                  component={Link}
                  href={`/admin/files/${version.id}`}
                >
                  View
                </Text>
              ) : null}
              <ActionIcon
                variant="subtle"
                aria-label={`Download version ${version.version_number}`}
                onClick={() =>
                  downloadFile(version.id, version.original_filename)
                }
              >
                <DownloadSimpleIcon size={16} aria-hidden />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}
