"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import {
  Badge,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { ReasonConfirmDialog } from "../../../_shared/ReasonConfirmDialog";
import { StatusBadge } from "../../../_shared/StatusBadge";
import { DELEGATION_TYPE_LABELS } from "../../../organization.constants";
import { createDelegation, fetchDelegations } from "../../delegations.api";
import { useRevokeDelegation } from "../../delegations.hooks";
import { delegationsQueryKeys } from "../../delegations.queryKeys";
import type { Delegation } from "../../delegations.types";
import { DelegationsForm } from "../../form/DelegationsForm";
import { getDelegationsColumns } from "./delegations.columns";

const TABS: DataTableShellTab[] = [
  { label: "All" },
  { label: "Active", filter: { status: "active" } },
  { label: "Planned", filter: { status: "planned" } },
  { label: "Revoked", filter: { status: "revoked" } },
  { label: "Expired", filter: { status: "expired" } },
  { label: "Archived", filter: { status: "archived" } },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Group justify="space-between" gap="md" wrap="nowrap">
      <Text size="xs" c="dimmed" style={{ minWidth: 130 }}>
        {label}
      </Text>
      <Text size="xs" ta="right">
        {value}
      </Text>
    </Group>
  );
}

export function DelegationsList() {
  const { id: orgId } = useParams<{ id: string }>();
  const [viewDelegation, setViewDelegation] = useState<Delegation | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Delegation | null>(null);

  const { mutate: revoke, isPending: isRevoking } = useRevokeDelegation(orgId);

  const columns = useMemo(() => getDelegationsColumns(setRevokeTarget), []);

  function handleRevokeConfirm(reason: string) {
    if (!revokeTarget) return;
    revoke(
      { id: revokeTarget.id, payload: { reason } },
      {
        onSuccess: () => {
          setRevokeTarget(null);
          setViewDelegation(null);
        },
      },
    );
  }

  return (
    <>
      <Paper
        p={0}
        withBorder
        radius="var(--mantine-radius-default)"
        h="calc(100vh - 16px)"
      >
        <ModalTableShell<Delegation>
          queryKey={delegationsQueryKeys.list(orgId)}
          queryGetFn={(params) => fetchDelegations(orgId, params)}
          dataKey="data"
          paginationKey="meta"
          enableServerQuery
          columns={columns}
          moduleInfo={{
            name: "delegations",
            label: "Delegations",
            description: "Manage authority delegations for this organisation",
          }}
          idAccessor="id"
          createFormComponent={DelegationsForm}
          onCreateApi={(values) => {
            const d = values as Partial<Delegation>;
            return createDelegation(orgId, {
              from_assignment_id: String(d.from_assignment ?? ""),
              to_assignment_id: String(d.to_assignment ?? ""),
              delegation_type: d.delegation_type ?? "acting_authority",
              scope_unit: (d.scope_unit as string | null) ?? null,
              starts_at: String(d.starts_at ?? ""),
              ends_at: d.ends_at ? String(d.ends_at) : null,
              reason: String(d.reason ?? ""),
            });
          }}
          onReviewClick={(delegation) => setViewDelegation(delegation)}
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
          tabs={TABS}
          basePath={`/admin/organization/${orgId}/delegations`}
        />
      </Paper>

      {/* Delegation detail drawer */}
      <Drawer
        opened={viewDelegation !== null}
        onClose={() => setViewDelegation(null)}
        title={
          <Group gap="sm">
            <Text fw={600}>Delegation Detail</Text>
            {viewDelegation && (
              <StatusBadge status={viewDelegation.status} size="xs" />
            )}
          </Group>
        }
        position="right"
        size="md"
      >
        {viewDelegation && (
          <Stack gap="sm">
            <DetailRow
              label="From"
              value={
                viewDelegation.from_assignment_label ??
                viewDelegation.from_assignment
              }
            />
            <DetailRow
              label="To"
              value={
                viewDelegation.to_assignment_label ??
                viewDelegation.to_assignment
              }
            />
            <DetailRow
              label="Type"
              value={
                DELEGATION_TYPE_LABELS[viewDelegation.delegation_type] ??
                viewDelegation.delegation_type
              }
            />
            <DetailRow
              label="Starts"
              value={formatDate(viewDelegation.starts_at)}
            />
            <DetailRow
              label="Ends"
              value={formatDate(viewDelegation.ends_at)}
            />
            {viewDelegation.scope_unit && (
              <DetailRow label="Scope Unit" value={viewDelegation.scope_unit} />
            )}
            {viewDelegation.reason && (
              <>
                <Divider />
                <Text size="xs" c="dimmed" fw={500}>
                  Reason
                </Text>
                <Text size="xs">{viewDelegation.reason}</Text>
              </>
            )}
            {viewDelegation.revocation_reason && (
              <>
                <Divider />
                <Text size="xs" c="dimmed" fw={500}>
                  Revocation reason
                </Text>
                <Text size="xs">{viewDelegation.revocation_reason}</Text>
                <DetailRow
                  label="Revoked at"
                  value={formatDate(viewDelegation.revoked_at)}
                />
              </>
            )}

            {(viewDelegation.status === "planned" ||
              viewDelegation.status === "active") && (
              <>
                <Divider mt="md" />
                <Badge
                  size="sm"
                  color="red"
                  variant="light"
                  style={{ cursor: "pointer", padding: "6px 12px" }}
                  fullWidth
                  onClick={() => setRevokeTarget(viewDelegation)}
                >
                  Revoke Delegation
                </Badge>
              </>
            )}
          </Stack>
        )}
      </Drawer>

      <ReasonConfirmDialog
        opened={revokeTarget !== null}
        onClose={() => setRevokeTarget(null)}
        title="Revoke Delegation"
        description={`This will revoke the delegation from "${revokeTarget?.from_assignment_label ?? revokeTarget?.from_assignment}" to "${revokeTarget?.to_assignment_label ?? revokeTarget?.to_assignment}".`}
        reasonRequired
        confirmLabel="Revoke"
        confirmColor="red"
        onConfirm={handleRevokeConfirm}
        loading={isRevoking}
      />
    </>
  );
}
