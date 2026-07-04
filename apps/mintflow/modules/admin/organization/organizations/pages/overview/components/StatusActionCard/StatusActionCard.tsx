"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Card,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Title,
  notifications,
  useDisclosure,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { changeOrganizationStatus } from "../../../../organizations.api";
import { organizationsQueryKeys } from "../../../../organizations.queryKeys";
import type { OrganizationStatus } from "../../../../organizations.types";
import type { StatusActionCardProps } from "./StatusActionCard.types";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "archived", label: "Archived" },
];

export function StatusActionCard({
  organization,
  hasRootUnit,
}: StatusActionCardProps) {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const isDraft = organization.status === "draft";
  const [targetStatus, setTargetStatus] = useState<OrganizationStatus>(
    isDraft ? "active" : organization.status,
  );
  const [reason, setReason] = useState("");

  const statusMutation = useMutation({
    mutationFn: () =>
      changeOrganizationStatus(organization.id, {
        status: targetStatus,
        reason,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.detail(organization.id),
      });
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.listKey(),
      });
      notifications.show({
        color: "green",
        title: "Status updated",
        message: `Organization status changed to "${targetStatus}".`,
      });
      close();
      setReason("");
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't update status",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleOpen() {
    setTargetStatus(isDraft ? "active" : organization.status);
    setReason("");
    open();
  }

  return (
    <>
      <Card withBorder padding="md" radius="md">
        <Group justify="space-between" align="center">
          <div>
            <Title order={5}>Status</Title>
            <Text size="xs" c="dimmed">
              {isDraft
                ? "This organization is still in draft and hidden from normal use."
                : "Change the organization's lifecycle status."}
            </Text>
          </div>
          <Button
            size="xs"
            color={isDraft ? "brand" : undefined}
            onClick={handleOpen}
          >
            {isDraft ? "Activate Organization" : "Change Status"}
          </Button>
        </Group>
      </Card>

      <Modal
        opened={opened}
        onClose={close}
        title={isDraft ? "Activate Organization" : "Change Organization Status"}
      >
        <Stack gap="md" p="md">
          {isDraft && !hasRootUnit && (
            <Alert
              color="orange"
              icon={<WarningIcon size={16} weight="fill" />}
              title="No root unit yet"
            >
              This organization doesn&apos;t have a root unit yet. You can still
              activate it, but staff won&apos;t be able to place members or
              positions until a structure exists.
            </Alert>
          )}
          <Select
            label="Status"
            data={STATUS_OPTIONS}
            value={targetStatus}
            onChange={(value) =>
              value && setTargetStatus(value as OrganizationStatus)
            }
            disabled={statusMutation.isPending}
          />
          <ReasonTextarea
            value={reason}
            onChange={setReason}
            required
            placeholder="e.g. Initial organization setup completed."
          />
          <Button
            fullWidth
            loading={statusMutation.isPending}
            disabled={!reason.trim()}
            onClick={() => statusMutation.mutate()}
          >
            Confirm
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
