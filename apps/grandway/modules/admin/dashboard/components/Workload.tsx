"use client";

import Link from "next/link";
import {
  Anchor,
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from "@peppermint/ui";
import { useDashboardWorkload } from "../dashboard.hooks";
import { WORKLOAD_LIST_LABELS } from "../dashboard.labels";
import type {
  ChecklistWorkloadRow,
  DashboardFilters,
  LeadWorkloadRow,
  OfferWorkloadRow,
} from "../dashboard.types";
import { SectionState } from "./SectionState";

function OwnerCell({
  ownerId,
  ownerDisplayName,
}: {
  ownerId: string | null | undefined;
  ownerDisplayName: string;
}) {
  return ownerId == null ? (
    <Badge size="sm" color="gray" variant="light">
      {ownerDisplayName}
    </Badge>
  ) : (
    <Text size="sm">{ownerDisplayName}</Text>
  );
}

function LeadWorkloadTable({ rows }: { rows: LeadWorkloadRow[] }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No leads on any owner&apos;s book.
      </Text>
    );
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Owner</Table.Th>
          <Table.Th>Open leads</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.owner_id ?? "unassigned"}>
            <Table.Td>
              <OwnerCell
                ownerId={row.owner_id}
                ownerDisplayName={row.owner_display_name}
              />
            </Table.Td>
            <Table.Td>{row.open_leads}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/** The `owner_id: null` "Unassigned" row is the most likely work to be missed — never filtered out. */
function ChecklistWorkloadTable({ rows }: { rows: ChecklistWorkloadRow[] }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No open checklist items.
      </Text>
    );
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Owner</Table.Th>
          <Table.Th>Open</Table.Th>
          <Table.Th>Overdue</Table.Th>
          <Table.Th>Blocked</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.owner_id ?? "unassigned"}>
            <Table.Td>
              <OwnerCell
                ownerId={row.owner_id}
                ownerDisplayName={row.owner_display_name}
              />
            </Table.Td>
            <Table.Td>{row.open_items}</Table.Td>
            <Table.Td>{row.overdue_items}</Table.Td>
            <Table.Td>{row.blocked_items}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/** Counts by who RECORDED the offer ("recorded by"), not an assignee. */
function OfferWorkloadTable({ rows }: { rows: OfferWorkloadRow[] }) {
  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        No offers awaiting a response.
      </Text>
    );
  }
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Recorded by</Table.Th>
          <Table.Th>Awaiting response</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map((row) => (
          <Table.Tr key={row.owner_id ?? "unassigned"}>
            <Table.Td>
              <OwnerCell
                ownerId={row.owner_id}
                ownerDisplayName={row.owner_display_name}
              />
            </Table.Td>
            <Table.Td>{row.awaiting_response}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

/**
 * Branch on `is_scoped_to_caller` BEFORE rendering anything (INTEGRATION.md
 * §7 "workload") — never infer team size from row count. The three lists are
 * NOT joinable into one row per person and must never be summed, so each
 * renders as its own table, never merged.
 *
 * Scoping itself is server-side, not something this component filters:
 * `leads` already holds at most the caller's own row when
 * `is_scoped_to_caller` is true, while `checklist_items` is explicitly
 * **never** owner-scoped even for a Lead Manager (the unassigned bucket must
 * stay visible to everyone). This component's only job for the flag is the
 * heading — "My workload" vs "Workload by owner" — never re-filtering rows
 * the backend has already decided to include.
 */
export function Workload({ filters }: { filters: DashboardFilters }) {
  const { data, isPending, isError, refetch, isRefetching } =
    useDashboardWorkload(filters);

  return (
    <Stack gap="sm">
      <Text fw={700}>
        {data?.is_scoped_to_caller ? "My workload" : "Workload by owner"}
      </Text>
      <SectionState
        isPending={isPending}
        isError={isError}
        errorMessage="Couldn't load workload."
        onRetry={() => refetch()}
        isRetrying={isRefetching}
        skeletonHeight={280}
      >
        {data ? (
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="sm">
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {WORKLOAD_LIST_LABELS.leads}
                  </Text>
                  <Anchor
                    component={Link}
                    href="/admin/lead-management"
                    size="xs"
                  >
                    View leads
                  </Anchor>
                </Group>
                <LeadWorkloadTable rows={data.leads} />
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {WORKLOAD_LIST_LABELS.checklist_items}
                  </Text>
                  <Anchor component={Link} href="/admin/checklists" size="xs">
                    View checklists
                  </Anchor>
                </Group>
                <ChecklistWorkloadTable rows={data.checklist_items} />
              </Stack>
            </Card>
            <Card withBorder radius="md" p="md">
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {WORKLOAD_LIST_LABELS.offers}
                  </Text>
                  <Anchor component={Link} href="/admin/offers" size="xs">
                    View offers
                  </Anchor>
                </Group>
                <OfferWorkloadTable rows={data.offers} />
              </Stack>
            </Card>
          </SimpleGrid>
        ) : null}
      </SectionState>
    </Stack>
  );
}
