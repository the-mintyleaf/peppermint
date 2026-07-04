"use client";

import {
  ActionIcon,
  Menu,
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

import { deactivatePosition } from "../../../../positions.api";
import type { PositionRowActionsMenuProps } from "./PositionRowActionsMenu.types";

export function PositionRowActionsMenu({
  position,
  onViewDetails,
}: PositionRowActionsMenuProps) {
  const queryClient = useQueryClient();

  const deactivateMutation = useMutation({
    mutationFn: () => deactivatePosition(position.id, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["positions"] });
      notifications.show({
        color: "green",
        title: "Position deactivated",
        message: `"${position.title}" is no longer active.`,
      });
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
    modals.openConfirmModal({
      title: "Deactivate position",
      children: (
        <Text size="sm">
          &quot;{position.title}&quot; will no longer be assignable. Historical
          assignments are kept. Continue?
        </Text>
      ),
      labels: { confirm: "Deactivate", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => deactivateMutation.mutate(),
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
