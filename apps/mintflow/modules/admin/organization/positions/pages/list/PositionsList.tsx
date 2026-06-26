"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  Paper,
  Stack,
  Text,
} from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import { BriefcaseIcon } from "@phosphor-icons/react/dist/csr/Briefcase";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ReasonConfirmDialog } from "../../../_shared/ReasonConfirmDialog";
import { StatusBadge } from "../../../_shared/StatusBadge";
import { POSITION_TYPE_LABELS } from "../../../organization.constants";
import { fetchPositions } from "../../positions.api";
import { useDeactivatePosition } from "../../positions.hooks";
import { positionsQueryKeys } from "../../positions.queryKeys";
import type { Position } from "../../positions.types";
import { getPositionsColumns } from "./positions.columns";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: BriefcaseIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "Draft", icon: FileIcon, filter: { status: "draft" } },
  { label: "Inactive", icon: MinusCircleIcon, filter: { status: "inactive" } },
  { label: "Abolished", icon: ProhibitIcon, filter: { status: "abolished" } },
  { label: "Archived", icon: ArchiveIcon, filter: { status: "archived" } },
];

const DEACTIVATABLE = new Set(["active", "draft"]);

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

export function PositionsList() {
  const { id: orgId } = useParams<{ id: string }>();
  const [viewPosition, setViewPosition] = useState<Position | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<Position | null>(
    null,
  );

  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivatePosition(orgId);

  const columns = useMemo(() => getPositionsColumns(setDeactivateTarget), []);

  function handleDeactivateConfirm(reason: string) {
    if (!deactivateTarget) return;
    deactivate(
      { id: deactivateTarget.id, reason },
      {
        onSuccess: () => {
          setDeactivateTarget(null);
          setViewPosition(null);
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
        <ModalTableShell<Position>
          queryKey={positionsQueryKeys.list(orgId)}
          queryGetFn={(params) => fetchPositions(orgId, params)}
          dataKey="data"
          paginationKey="meta"
          enableServerQuery
          columns={columns}
          moduleInfo={{
            name: "positions",
            label: "Positions",
            description: "View and manage organisational positions",
          }}
          idAccessor="id"
          onReviewClick={(position) => setViewPosition(position)}
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
          tabs={TABS}
          basePath={`/admin/organization/${orgId}/positions`}
        />
      </Paper>

      {/* Position detail drawer */}
      <Drawer
        opened={viewPosition !== null}
        onClose={() => setViewPosition(null)}
        title={
          <Group gap="sm">
            <Text fw={600}>{viewPosition?.title}</Text>
            {viewPosition && (
              <StatusBadge status={viewPosition.status} size="xs" />
            )}
          </Group>
        }
        position="right"
        size="md"
      >
        {viewPosition && (
          <Stack gap="sm">
            <DetailRow label="Code" value={viewPosition.code} />
            <DetailRow
              label="Type"
              value={
                POSITION_TYPE_LABELS[viewPosition.position_type] ??
                viewPosition.position_type
              }
            />
            <DetailRow label="Unit" value={viewPosition.unit} />
            <DetailRow
              label="Leadership"
              value={
                viewPosition.is_leadership ? (
                  <Badge size="xs" color="blue">
                    Yes
                  </Badge>
                ) : (
                  "No"
                )
              }
            />
            <DetailRow
              label="Supervisory"
              value={
                viewPosition.is_supervisory ? (
                  <Badge size="xs" color="violet">
                    Yes
                  </Badge>
                ) : (
                  "No"
                )
              }
            />
            <DetailRow
              label="Single Occupant"
              value={viewPosition.is_single_occupant ? "Yes" : "No"}
            />
            <DetailRow
              label="Max Occupants"
              value={String(viewPosition.max_occupants)}
            />
            <DetailRow
              label="Effective From"
              value={formatDate(viewPosition.effective_from)}
            />
            <DetailRow
              label="Effective To"
              value={formatDate(viewPosition.effective_to)}
            />
            {viewPosition.description && (
              <>
                <Divider />
                <Text size="xs" c="dimmed">
                  {viewPosition.description}
                </Text>
              </>
            )}

            {DEACTIVATABLE.has(viewPosition.status) && (
              <>
                <Divider mt="md" />
                <Button
                  color="red"
                  variant="light"
                  fullWidth
                  onClick={() => setDeactivateTarget(viewPosition)}
                >
                  Deactivate Position
                </Button>
              </>
            )}
          </Stack>
        )}
      </Drawer>

      <ReasonConfirmDialog
        opened={deactivateTarget !== null}
        onClose={() => setDeactivateTarget(null)}
        title="Deactivate Position"
        description={`This will deactivate "${deactivateTarget?.title}". Existing assignments are preserved.`}
        reasonRequired={false}
        confirmLabel="Deactivate"
        confirmColor="red"
        onConfirm={handleDeactivateConfirm}
        loading={isDeactivating}
      />
    </>
  );
}
