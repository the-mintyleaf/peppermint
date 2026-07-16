"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  DateInput,
  Group,
  Modal,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  modals,
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";

import {
  UnitPickerSelect,
  useUnitOptions,
} from "../../../../../_shared/components/UnitPickerSelect";
import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import {
  createUnitMembership,
  endUnitMembership,
  fetchUnitMemberships,
} from "../../../../members.api";
import { membersQueryKeys } from "../../../../members.queryKeys";
import type { UnitMembershipsTabProps } from "./UnitMembershipsTab.types";

function EndUnitMembershipModalContent({
  isLoading,
  onConfirm,
}: {
  isLoading: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Text size="sm">This does not end the organization membership.</Text>
      <ReasonTextarea value={reason} onChange={setReason} required />
      <Button
        fullWidth
        color="red"
        loading={isLoading}
        disabled={!reason.trim()}
        onClick={() => onConfirm(reason)}
      >
        End Unit Membership
      </Button>
    </Stack>
  );
}

export function UnitMembershipsTab({
  organizationId,
  membershipId,
}: UnitMembershipsTabProps) {
  const queryClient = useQueryClient();
  const { data: unitMemberships, isLoading } = useQuery({
    queryKey: membersQueryKeys.unitMemberships(membershipId),
    queryFn: () => fetchUnitMemberships(membershipId),
  });
  const { data: units } = useUnitOptions(organizationId);
  const unitNameById = useMemo(
    () => new Map((units ?? []).map((u) => [u.id, `${u.name_np} (${u.code})`])),
    [units],
  );

  const [modalOpened, setModalOpened] = useState(false);
  const [unitId, setUnitId] = useState<string | null>(null);
  const [membershipType, setMembershipType] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [validFrom, setValidFrom] = useState<string | null>(null);
  const [validTo, setValidTo] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [codeError, setCodeError] = useState<string | undefined>();

  const createMutation = useMutation({
    mutationFn: () =>
      createUnitMembership(membershipId, {
        unit_id: unitId as string,
        membership_type: membershipType || undefined,
        is_primary: isPrimary,
        valid_from: validFrom,
        valid_to: validTo,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.unitMemberships(membershipId),
      });
      notifications.show({ color: "green", message: "Unit membership added." });
      setModalOpened(false);
      setUnitId(null);
      setMembershipType("");
      setIsPrimary(false);
      setValidFrom(null);
      setValidTo(null);
      setReason("");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "ORGANIZATION_CROSS_ORGANIZATION_REFERENCE") {
        setCodeError(apiError.message);
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't add unit membership",
        message: getApiErrorMessage(error),
      });
    },
  });

  const endMutation = useMutation({
    mutationFn: ({
      unitMembershipId,
      reason: endReason,
    }: {
      unitMembershipId: string;
      reason: string;
    }) => endUnitMembership(unitMembershipId, { reason: endReason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: membersQueryKeys.unitMemberships(membershipId),
      });
      notifications.show({ color: "green", message: "Unit membership ended." });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't end unit membership",
        message: getApiErrorMessage(error),
      });
    },
  });

  function requestEnd(unitMembershipId: string) {
    modals.open({
      title: "End unit membership",
      children: (
        <EndUnitMembershipModalContent
          isLoading={endMutation.isPending}
          onConfirm={(endReason) =>
            endMutation.mutate({ unitMembershipId, reason: endReason })
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
          Add Unit Membership
        </Button>
      </Group>

      {isLoading ? (
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      ) : !unitMemberships?.length ? (
        <Text size="sm" c="dimmed">
          No unit memberships yet.
        </Text>
      ) : (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Unit</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Primary</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {unitMemberships.map((um) => (
              <Table.Tr key={um.id}>
                <Table.Td>{unitNameById.get(um.unit) ?? um.unit}</Table.Td>
                <Table.Td>
                  <Badge size="xs" color={um.is_primary ? "blue" : "gray"}>
                    {um.membership_type || "—"}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {um.is_primary && <Badge size="xs">Primary</Badge>}
                </Table.Td>
                <Table.Td>{um.status}</Table.Td>
                <Table.Td>
                  {um.status === "active" && (
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => requestEnd(um.id)}
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
        title="Add Unit Membership"
      >
        <Stack gap="md" p="md">
          <UnitPickerSelect
            organizationId={organizationId}
            required
            value={unitId}
            onChange={setUnitId}
            error={codeError}
          />
          <TextInput
            label="Membership Type"
            placeholder="e.g. primary, secondment, matrix"
            value={membershipType}
            onChange={(e) => setMembershipType(e.currentTarget.value)}
          />
          <Switch
            label="Primary unit"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.currentTarget.checked)}
          />
          <DateInput
            label="Valid from"
            clearable
            value={validFrom}
            onChange={setValidFrom}
          />
          <DateInput
            label="Valid to"
            clearable
            value={validTo}
            onChange={setValidTo}
          />
          <ReasonTextarea
            value={reason}
            onChange={setReason}
            placeholder="e.g. Placed into Public Health Division after onboarding."
          />
          <Button
            fullWidth
            loading={createMutation.isPending}
            disabled={!unitId}
            onClick={() => createMutation.mutate()}
          >
            Add
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
