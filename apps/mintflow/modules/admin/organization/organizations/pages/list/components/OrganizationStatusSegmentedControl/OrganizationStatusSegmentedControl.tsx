"use client";

import { useState } from "react";
import {
  Button,
  SegmentedControl,
  Stack,
  Text,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { changeOrganizationStatus } from "../../../../organizations.api";
import { organizationsQueryKeys } from "../../../../organizations.queryKeys";
import type { OrganizationStatus } from "../../../../organizations.types";
import type { OrganizationStatusSegmentedControlProps } from "./OrganizationStatusSegmentedControl.types";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function ChangeStatusModalContent({
  organizationName,
  targetStatus,
  isLoading,
  onConfirm,
}: {
  organizationName: string;
  targetStatus: OrganizationStatus;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Text size="sm">
        Change &quot;{organizationName}&quot;&apos;s status to{" "}
        <strong>{targetStatus}</strong>.
      </Text>
      <ReasonTextarea value={reason} onChange={setReason} required />
      <Button
        fullWidth
        loading={isLoading}
        disabled={!reason.trim()}
        onClick={() => onConfirm(reason)}
      >
        Confirm
      </Button>
    </Stack>
  );
}

export function OrganizationStatusSegmentedControl({
  organization,
}: OrganizationStatusSegmentedControlProps) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: (variables: { status: OrganizationStatus; reason: string }) =>
      changeOrganizationStatus(organization.id, variables),
    onSuccess: (updated) => {
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.listKey(),
      });
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.detail(organization.id),
      });
      notifications.show({
        color: "green",
        title: "Status updated",
        message: `Organization status changed to "${updated.status}".`,
      });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't update status",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleChange(value: string) {
    const targetStatus = value as OrganizationStatus;
    if (targetStatus === organization.status) {
      return;
    }
    modals.open({
      title: "Change organization status",
      children: (
        <ChangeStatusModalContent
          organizationName={organization.name}
          targetStatus={targetStatus}
          isLoading={statusMutation.isPending}
          onConfirm={(reason) =>
            statusMutation.mutate({ status: targetStatus, reason })
          }
        />
      ),
    });
  }

  return (
    <div onClick={(event) => event.stopPropagation()}>
      <SegmentedControl
        size="xs"
        value={organization.status}
        onChange={handleChange}
        data={STATUS_OPTIONS}
      />
    </div>
  );
}
