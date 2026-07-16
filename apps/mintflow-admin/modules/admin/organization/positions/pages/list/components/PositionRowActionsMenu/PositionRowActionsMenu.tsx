"use client";

import { useState } from "react";
import {
  ActionIcon,
  Button,
  Menu,
  Stack,
  Text,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { deactivatePosition } from "../../../../positions.api";
import type { PositionRowActionsMenuProps } from "./PositionRowActionsMenu.types";

function DeactivatePositionModalContent({
  titleNp,
  isLoading,
  onConfirm,
}: {
  titleNp: string;
  isLoading: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Text size="sm">
        &quot;{titleNp}&quot; will no longer be assignable. Historical
        assignments are kept.
      </Text>
      <ReasonTextarea value={reason} onChange={setReason} required />
      <Button
        fullWidth
        color="red"
        loading={isLoading}
        disabled={!reason.trim()}
        onClick={() => onConfirm(reason)}
      >
        Deactivate Position
      </Button>
    </Stack>
  );
}

export function PositionRowActionsMenu({
  position,
  onViewDetails,
}: PositionRowActionsMenuProps) {
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: (reason: string) => deactivatePosition(position.id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["positions"] });
      notifications.show({
        color: "green",
        title: "Position deactivated",
        message: `"${position.title_np}" is no longer active.`,
      });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't deactivate position",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleDeactivate() {
    modals.open({
      title: "Deactivate position",
      children: (
        <DeactivatePositionModalContent
          titleNp={position.title_np}
          isLoading={deactivateMutation.isPending}
          onConfirm={(reason) => deactivateMutation.mutate(reason)}
        />
      ),
    });
  }

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label="Row actions">
          <DotsThreeVerticalIcon size={16} aria-hidden />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<EyeIcon size={14} aria-hidden />}
          onClick={() => onViewDetails(position)}
        >
          View details
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<ProhibitIcon size={14} aria-hidden />}
          color="red"
          disabled={position.status !== "active" && position.status !== "draft"}
          onClick={handleDeactivate}
        >
          Deactivate
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
