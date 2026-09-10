"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Group,
  Loader,
  Select,
  Stack,
  Text,
} from "@peppermint/ui";
import { Plus as PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useSignatoryList } from "../../../signatures.hooks";
import { SIGNATORY_STATUS_LABELS } from "../../../signatures.labels";
import type { SignatoryStatus } from "../../../signatures.types";
import { SignatoryRow } from "./SignatoryRow";

interface SignatoryListViewProps {
  onCreate: () => void;
  onEdit: (id: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  ...(["draft", "active", "inactive"] as SignatoryStatus[]).map((s) => ({
    value: s,
    label: SIGNATORY_STATUS_LABELS[s],
  })),
];

/**
 * The library. Defaults to **all** statuses rather than `?status=active`,
 * because a management screen that hid drafts would hide the signatory the user
 * just created and look broken (§7) — the picker is the surface that filters.
 */
export function SignatoryListView({
  onCreate,
  onEdit,
}: SignatoryListViewProps) {
  const [status, setStatus] = useState<string>("");
  const query = useSignatoryList(
    status ? { status: status as SignatoryStatus } : {},
  );

  const rows = query.data?.data ?? [];
  const total = query.data?.meta.total ?? 0;
  // `page_size` is capped at 100 and clamps silently (§3), so a library that
  // outgrows one page would truncate with nothing reporting it. Say so rather
  // than showing a list that is quietly wrong.
  const isTruncated = total > rows.length;

  return (
    <Stack gap="sm" p="md">
      <Group justify="space-between" align="center">
        <Select
          size="xs"
          w={180}
          data={STATUS_OPTIONS}
          value={status}
          onChange={(v) => setStatus(v ?? "")}
          aria-label="Filter signatories by status"
        />
        <Button
          size="xs"
          leftSection={<PlusIcon size={14} aria-hidden />}
          onClick={onCreate}
        >
          New signatory
        </Button>
      </Group>

      {query.isLoading ? (
        <Group justify="center" py="xl">
          <Loader size="sm" aria-label="Loading signatories" />
        </Group>
      ) : query.isError ? (
        <Alert
          variant="light"
          color="red"
          icon={<WarningIcon size={16} aria-hidden />}
          title="Couldn't load signatories"
        >
          <Text size="xs">
            The signatory library is Admin-only on every route, reads included.
            If this keeps failing, check that your account still has Admin
            authority.
          </Text>
        </Alert>
      ) : rows.length === 0 ? (
        <Stack gap={4} align="center" py="xl">
          <Text size="sm" fw={500}>
            {status ? "No signatories with that status" : "No signatories yet"}
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            {status
              ? "Clear the filter to see the rest of the library."
              : "Add a signer, upload their signature, then activate them so certificates can name them."}
          </Text>
        </Stack>
      ) : (
        <Stack gap={0}>
          {isTruncated ? (
            <Alert variant="light" color="yellow" mb="xs">
              <Text size="xs">
                Showing the first {rows.length} of {total}. Filter by status to
                narrow the list.
              </Text>
            </Alert>
          ) : null}
          {rows.map((signatory) => (
            <SignatoryRow
              key={signatory.id}
              signatory={signatory}
              onEdit={onEdit}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
