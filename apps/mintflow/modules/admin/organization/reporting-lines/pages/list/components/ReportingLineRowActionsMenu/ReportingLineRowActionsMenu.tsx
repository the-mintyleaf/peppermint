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
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { endReportingLine } from "../../../../reportingLines.api";
import type { ReportingLineRowActionsMenuProps } from "./ReportingLineRowActionsMenu.types";

export function ReportingLineRowActionsMenu({
  reportingLine,
  onViewChain,
}: ReportingLineRowActionsMenuProps) {
  const queryClient = useQueryClient();

  const endMutation = useMutation({
    mutationFn: () => endReportingLine(reportingLine.id, {}),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reporting-lines"] });
      notifications.show({ color: "green", message: "Reporting line ended." });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't end reporting line",
        message: getApiErrorMessage(error),
      });
    },
  });

  function handleEnd() {
    modals.openConfirmModal({
      title: "End reporting line",
      children: (
        <Text size="sm">
          This chain-of-command link will no longer apply. Continue?
        </Text>
      ),
      labels: { confirm: "End", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => endMutation.mutate(),
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
          leftSection={<TreeStructureIcon size={14} aria-hidden />}
          onClick={() => onViewChain(reportingLine)}
        >
          View chain of command
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<ProhibitIcon size={14} aria-hidden />}
          color="red"
          disabled={reportingLine.status !== "active"}
          onClick={handleEnd}
        >
          End
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
