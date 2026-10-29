"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  VisuallyHidden,
  dayjs,
} from "@peppermint/ui";
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ArrowCounterClockwise";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { QueryErrorState } from "@/components/QueryErrorState";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useLeadAccess } from "../../../../leadAccess.hooks";
import type { DeletedLeadRow } from "../../../../leadManagement.api";
import {
  useDeletedLeads,
  useRestoreLead,
} from "../../../../leadManagement.hooks";
import { openRestoreLeadModal } from "../../leadDeletion.utils";
import type { DeletedLeadsModalProps } from "./DeletedLeadsModal.types";

const PAGE_SIZE = 20;

function primaryNumber(lead: DeletedLeadRow): string {
  const primary =
    lead.contact_numbers.find((c) => c.is_primary) ?? lead.contact_numbers[0];
  return primary?.number ?? "";
}

function DeletedLeadTableRow({
  lead,
  onView,
  onRestore,
}: {
  lead: DeletedLeadRow;
  onView: () => void;
  onRestore: () => void;
}) {
  const contact = lead.email || primaryNumber(lead);
  const owner = lead.created_by.display_name || lead.created_by.username;

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={0}>
          <Text size="xs" fw={500}>
            {lead.full_name}
          </Text>
          {contact ? (
            <Text size="xs" c="dimmed">
              {contact}
            </Text>
          ) : null}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="xs">{owner}</Text>
      </Table.Td>
      <Table.Td>
        {/* The list shape may omit `deleted_at`; the drawer always has it. */}
        <Text size="xs" c={lead.deleted_at ? undefined : "dimmed"}>
          {lead.deleted_at
            ? dayjs(lead.deleted_at).format("MMM D, YYYY")
            : "Open to see"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Button size="compact-xs" variant="subtle" onClick={onView}>
            View
          </Button>
          <Button
            size="compact-xs"
            variant="light"
            leftSection={<ArrowCounterClockwiseIcon size={12} aria-hidden />}
            onClick={onRestore}
          >
            Restore
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

/**
 * Admin-only list of soft-deleted leads (`GET /leads/?deleted=true`) — the
 * one place they appear, since the board, search and dashboards hide them for
 * everyone. Each row restores in place (optional reason) or opens the lead's
 * drawer, which shows when, by whom and why it was deleted. The trigger is
 * hidden from a Lead Manager at the call site, and the query is gated on the
 * same flag, so it can never fire into the 403.
 *
 * States: loading (first page) · paging (dimmed rows) · empty · request-failed
 * with retry · pending restore (the confirm modal's spinner).
 */
export function DeletedLeadsModal({
  opened,
  onClose,
  onViewLead,
}: DeletedLeadsModalProps) {
  const { isLeadAdmin } = useLeadAccess();
  const [page, setPage] = useState(1);
  const query = useDeletedLeads(page, PAGE_SIZE, opened && isLeadAdmin);
  const restoreLead = useRestoreLead();

  const rows = query.data?.data ?? [];
  const pageCount = Math.ceil((query.data?.total ?? 0) / PAGE_SIZE);
  const lastOnPage = rows.length === 1 && page > 1;

  const handleRestore = (lead: DeletedLeadRow) =>
    openRestoreLeadModal(lead, restoreLead.mutateAsync, () => {
      if (lastOnPage) setPage(page - 1);
    });

  const handleView = (lead: DeletedLeadRow) => {
    onClose();
    onViewLead(lead.id);
  };

  const renderBody = () => {
    if (query.isLoading) {
      return (
        <Center py="xl">
          <Loader size="sm" aria-label="Loading deleted leads" />
        </Center>
      );
    }
    if (query.isError) {
      return (
        <QueryErrorState
          message={getApiErrorMessage(query.error)}
          onRetry={() => void query.refetch()}
          isRetrying={query.isFetching}
        />
      );
    }
    if (rows.length === 0) {
      return (
        <Stack align="center" gap="xs" py="xl">
          <TrashIcon size={28} aria-hidden />
          <Text size="sm" c="dimmed" ta="center">
            No deleted leads. Leads an Admin deletes appear here until they are
            restored.
          </Text>
        </Stack>
      );
    }
    return (
      <Stack gap="sm">
        <Table.ScrollContainer minWidth={480}>
          <Table
            verticalSpacing="xs"
            aria-busy={query.isPlaceholderData}
            style={{ opacity: query.isPlaceholderData ? 0.6 : 1 }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Lead</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Deleted</Table.Th>
                <Table.Th>
                  <VisuallyHidden>Actions</VisuallyHidden>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((lead) => (
                <DeletedLeadTableRow
                  key={lead.id}
                  lead={lead}
                  onView={() => handleView(lead)}
                  onRestore={() => handleRestore(lead)}
                />
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {pageCount > 1 ? (
          <Group justify="center">
            <Pagination
              size="sm"
              total={pageCount}
              value={page}
              onChange={setPage}
            />
          </Group>
        ) : null}
      </Stack>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Deleted leads"
      size={720}
      radius="md"
      centered
    >
      <Box p="md">
        <Stack gap="sm">
          <Text size="xs" c="dimmed">
            Hidden from the board, search and dashboards. Restoring brings a
            lead back exactly as it was.
          </Text>
          {renderBody()}
        </Stack>
      </Box>
    </Modal>
  );
}
