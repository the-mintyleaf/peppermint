"use client";

import { useState } from "react";
import {
  Badge,
  Button,
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

import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

import { UnitPickerSelect } from "../../../../../_shared/components/UnitPickerSelect";
import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import {
  createPositionAssignment,
  endPositionAssignment,
  fetchPositionAssignments,
} from "../../../../members.api";
import { membersQueryKeys } from "../../../../members.queryKeys";
import type { AssignmentType } from "../../../../members.types";
import { fetchPositions } from "../../../../../positions/positions.api";
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
  const [isPrimary, setIsPrimary] = useState(false);
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

  const createMutation = useMutation({
    mutationFn: () =>
      createPositionAssignment(membershipId, {
        position_id: positionId as string,
        assignment_type: assignmentType,
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
    mutationFn: (assignmentId: string) =>
      endPositionAssignment(assignmentId, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.positionAssignments(membershipId),
      });
      notifications.show({ color: "green", message: "Assignment ended." });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't end assignment",
        message: getApiErrorMessage(error),
      });
    },
  });

  function requestEnd(assignmentId: string) {
    modals.openConfirmModal({
      title: "End position assignment",
      children: (
        <Text size="sm">
          This does not end unit or organization membership. Continue?
        </Text>
      ),
      labels: { confirm: "End", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => endMutation.mutate(assignmentId),
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
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => requestEnd(assignment.id)}
                    >
                      End
                    </Button>
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
          <Switch
            label="Primary assignment"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.currentTarget.checked)}
          />
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
