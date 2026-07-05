"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  DateInput,
  Group,
  Modal,
  Select,
  Stack,
  Switch,
  Table,
  Text,
  modals,
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

import { UnitPickerSelect } from "../../../../../_shared/components/UnitPickerSelect";
import { PositionPickerSelect } from "../../../../../_shared/components/PositionPickerSelect";
import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import {
  createPositionAssignment,
  endPositionAssignment,
  fetchPositionAssignments,
  transferPositionAssignment,
} from "../../../../members.api";
import { membersQueryKeys } from "../../../../members.queryKeys";
import type { AssignmentType } from "../../../../members.types";
import type { AssignmentStatus } from "../../../../../_shared/organization.types";
import {
  fetchPositionHolders,
  fetchPositions,
} from "../../../../../positions/positions.api";
import { positionsQueryKeys } from "../../../../../positions/positions.queryKeys";
import type { PositionAssignmentsTabProps } from "./PositionAssignmentsTab.types";

const ASSIGNMENT_TYPE_OPTIONS: { value: AssignmentType; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "acting", label: "Acting" },
  { value: "temporary", label: "Temporary" },
  { value: "delegated", label: "Delegated" },
  { value: "observer", label: "Observer" },
  { value: "external", label: "External" },
  { value: "system", label: "System" },
];

const ASSIGNMENT_STATUS_OPTIONS: { value: AssignmentStatus; label: string }[] =
  [
    { value: "planned", label: "Planned" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
  ];

function EndPositionAssignmentModalContent({
  isLoading,
  onConfirm,
}: {
  isLoading: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Text size="sm">This does not end unit or organization membership.</Text>
      <ReasonTextarea value={reason} onChange={setReason} />
      <Button
        fullWidth
        color="red"
        loading={isLoading}
        onClick={() => onConfirm(reason)}
      >
        End Assignment
      </Button>
    </Stack>
  );
}

function TransferPositionAssignmentModalContent({
  organizationId,
  isLoading,
  onConfirm,
}: {
  organizationId: string;
  isLoading: boolean;
  onConfirm: (newPositionId: string, reason: string) => void;
}) {
  const [newPositionId, setNewPositionId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <PositionPickerSelect
        organizationId={organizationId}
        label="New position"
        required
        value={newPositionId}
        onChange={setNewPositionId}
      />
      <ReasonTextarea value={reason} onChange={setReason} required />
      <Button
        fullWidth
        loading={isLoading}
        disabled={!newPositionId || !reason.trim()}
        onClick={() => newPositionId && onConfirm(newPositionId, reason)}
      >
        Transfer Assignment
      </Button>
    </Stack>
  );
}

export function PositionAssignmentsTab({
  organizationId,
  membershipId,
}: PositionAssignmentsTabProps) {
  const queryClient = useQueryClient();
  const { data: assignments, isLoading } = useQuery({
    queryKey: membersQueryKeys.positionAssignments(membershipId),
    queryFn: () => fetchPositionAssignments(membershipId),
  });

  const [modalOpened, setModalOpened] = useState(false);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [positionId, setPositionId] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] =
    useState<AssignmentType>("primary");
  const [assignmentStatus, setAssignmentStatus] =
    useState<AssignmentStatus>("active");
  const [isPrimary, setIsPrimary] = useState(false);
  const [startsAt, setStartsAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [apiFieldError, setApiFieldError] = useState<string | undefined>();

  const { data: unitPositions } = useQuery({
    queryKey: positionsQueryKeys.listKey(unitId ?? ""),
    queryFn: () => fetchPositions(unitId as string),
    enabled: Boolean(unitId),
  });
  const positionOptions = (unitPositions?.data ?? []).map((p) => ({
    value: p.id,
    label: `${p.title} (${p.code})`,
  }));

  const selectedPosition = (unitPositions?.data ?? []).find(
    (p) => p.id === positionId,
  );

  const { data: holders } = useQuery({
    queryKey: positionsQueryKeys.holders(positionId ?? ""),
    queryFn: () => fetchPositionHolders(positionId as string),
    enabled: Boolean(positionId),
  });
  const activeHolderCount = (holders ?? []).filter(
    (h) => h.status === "active",
  ).length;
  const isNearCapacity =
    Boolean(selectedPosition) &&
    selectedPosition!.max_occupants > 0 &&
    activeHolderCount >= selectedPosition!.max_occupants;

  const createMutation = useMutation({
    mutationFn: () =>
      createPositionAssignment(membershipId, {
        position_id: positionId as string,
        assignment_type: assignmentType,
        status: assignmentStatus,
        starts_at: startsAt,
        ends_at: endsAt,
        is_primary: isPrimary,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.positionAssignments(membershipId),
      });
      notifications.show({
        color: "green",
        message: "Position assignment created.",
      });
      setModalOpened(false);
      setUnitId(null);
      setPositionId(null);
      setIsPrimary(false);
      setStartsAt(null);
      setEndsAt(null);
      setReason("");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (
        apiError.code === "ORGANIZATION_POSITION_INACTIVE" ||
        apiError.code === "ORGANIZATION_POSITION_CAPACITY_EXCEEDED"
      ) {
        setApiFieldError(apiError.message);
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't create assignment",
        message: getApiErrorMessage(error),
      });
    },
  });

  const endMutation = useMutation({
    mutationFn: ({
      assignmentId,
      reason: endReason,
    }: {
      assignmentId: string;
      reason: string;
    }) => endPositionAssignment(assignmentId, { reason: endReason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.positionAssignments(membershipId),
      });
      notifications.show({ color: "green", message: "Assignment ended." });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't end assignment",
        message: getApiErrorMessage(error),
      });
    },
  });

  const transferMutation = useMutation({
    mutationFn: ({
      assignmentId,
      newPositionId,
      reason: transferReason,
    }: {
      assignmentId: string;
      newPositionId: string;
      reason: string;
    }) =>
      transferPositionAssignment(assignmentId, {
        new_position_id: newPositionId,
        reason: transferReason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.positionAssignments(membershipId),
      });
      notifications.show({
        color: "green",
        message: "Assignment transferred.",
      });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't transfer assignment",
        message: getApiErrorMessage(error),
      });
    },
  });

  function requestEnd(assignmentId: string) {
    modals.open({
      title: "End position assignment",
      children: (
        <EndPositionAssignmentModalContent
          isLoading={endMutation.isPending}
          onConfirm={(endReason) =>
            endMutation.mutate({ assignmentId, reason: endReason })
          }
        />
      ),
    });
  }

  function requestTransfer(assignmentId: string) {
    modals.open({
      title: "Transfer position assignment",
      children: (
        <TransferPositionAssignmentModalContent
          organizationId={organizationId}
          isLoading={transferMutation.isPending}
          onConfirm={(newPositionId, transferReason) =>
            transferMutation.mutate({
              assignmentId,
              newPositionId,
              reason: transferReason,
            })
          }
        />
      ),
    });
  }

  return (
    <Stack gap="md">
      <Group justify="flex-end">
        <Button
          size="xs"
          leftSection={<PlusIcon size={13} />}
          onClick={() => setModalOpened(true)}
        >
          Add Position Assignment
        </Button>
      </Group>

      {isLoading ? (
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      ) : !assignments?.length ? (
        <Text size="sm" c="dimmed">
          No position assignments yet.
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Type</Table.Th>
              <Table.Th>Primary</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments.map((assignment) => (
              <Table.Tr key={assignment.id}>
                <Table.Td>{assignment.assignment_type}</Table.Td>
                <Table.Td>
                  {assignment.is_primary && <Badge size="xs">Primary</Badge>}
                </Table.Td>
                <Table.Td>{assignment.status}</Table.Td>
                <Table.Td>
                  {assignment.status === "active" && (
                    <Group gap="xs">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => requestTransfer(assignment.id)}
                      >
                        Transfer
                      </Button>
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        onClick={() => requestEnd(assignment.id)}
                      >
                        End
                      </Button>
                    </Group>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add Position Assignment"
      >
        <Stack gap="md" p="md">
          <UnitPickerSelect
            organizationId={organizationId}
            label="Unit"
            value={unitId}
            onChange={(id) => {
              setUnitId(id);
              setPositionId(null);
            }}
          />
          <Select
            label="Position"
            placeholder={unitId ? "Select a position" : "Select a unit first"}
            data={positionOptions}
            disabled={!unitId}
            value={positionId}
            onChange={setPositionId}
            error={apiFieldError}
          />
          <Select
            label="Assignment Type"
            data={ASSIGNMENT_TYPE_OPTIONS}
            value={assignmentType}
            onChange={(value) =>
              value && setAssignmentType(value as AssignmentType)
            }
          />
          <Select
            label="Status"
            data={ASSIGNMENT_STATUS_OPTIONS}
            value={assignmentStatus}
            onChange={(value) =>
              value && setAssignmentStatus(value as AssignmentStatus)
            }
          />
          <DateInput
            label="Starts at"
            clearable
            value={startsAt}
            onChange={setStartsAt}
          />
          <DateInput
            label="Ends at"
            clearable
            value={endsAt}
            onChange={setEndsAt}
          />
          <Switch
            label="Primary assignment"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.currentTarget.checked)}
          />
          {isNearCapacity && (
            <Alert
              color="orange"
              icon={<WarningIcon size={16} weight="fill" aria-hidden />}
            >
              This position is at capacity ({activeHolderCount}/
              {selectedPosition!.max_occupants}). Creating this assignment may
              be rejected.
            </Alert>
          )}
          <ReasonTextarea
            value={reason}
            onChange={setReason}
            placeholder="e.g. Approved director assignment."
          />
          <Button
            fullWidth
            loading={createMutation.isPending}
            disabled={!positionId}
            onClick={() => createMutation.mutate()}
          >
            Add
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
