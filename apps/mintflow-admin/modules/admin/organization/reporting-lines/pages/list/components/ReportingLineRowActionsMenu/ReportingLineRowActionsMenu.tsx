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
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { ReasonTextarea } from "../../../../../_shared/components/ReasonTextarea";
import { endReportingLine } from "../../../../reportingLines.api";
import type { ReportingLineRowActionsMenuProps } from "./ReportingLineRowActionsMenu.types";

function EndReportingLineModalContent({
  isLoading,
  onConfirm,
}: {
  isLoading: boolean;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="md">
      <Text size="sm">This chain-of-command link will no longer apply.</Text>
      <ReasonTextarea value={reason} onChange={setReason} required />
      <Button
        fullWidth
        color="red"
        loading={isLoading}
        disabled={!reason.trim()}
        onClick={() => onConfirm(reason)}
      >
        End Reporting Line
      </Button>
    </Stack>
  );
}

export function ReportingLineRowActionsMenu({
  reportingLine,
  onViewChain,
}: ReportingLineRowActionsMenuProps) {
  const queryClient = useQueryClient();

  const endMutation = useMutation({
    mutationFn: (reason: string) =>
      endReportingLine(reportingLine.id, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reporting-lines"] });
      notifications.show({ color: "green", message: "Reporting line ended." });
      modals.closeAll();
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
    modals.open({
      title: "End reporting line",
      children: (
        <EndReportingLineModalContent
          isLoading={endMutation.isPending}
          onConfirm={(reason) => endMutation.mutate(reason)}
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
