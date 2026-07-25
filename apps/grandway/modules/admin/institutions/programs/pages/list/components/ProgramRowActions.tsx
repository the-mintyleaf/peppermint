"use client";

import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  openReasonConfirmModal,
  RowActionsMenu,
  useModalTableShellContext,
} from "@peppermint/admin";
import { useWithdrawProgram } from "../../../../institutions.hooks";
import type { Program } from "../../../../institutions.types";

interface ProgramRowActionsProps {
  program: Program;
  canManage: boolean;
  onView: (program: Program) => void;
}

export function ProgramRowActions({
  program,
  canManage,
  onView,
}: ProgramRowActionsProps) {
  const withdraw = useWithdrawProgram();
  const { openEditModal } = useModalTableShellContext<Program>();

  const handleWithdraw = (record: Program) =>
    openReasonConfirmModal({
      title: "Withdraw program",
      parentLabel: "Programs",
      tone: "danger",
      alertTitle: "This drops the program from the default search",
      description: "Nothing is deleted — you can restore it later.",
      confirmLabel: "Withdraw",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await withdraw.mutateAsync({ id: record.id, note: reason });
      },
    });

  return (
    <RowActionsMenu<Program>
      record={program}
      actions={[
        {
          label: "View",
          icon: <EyeIcon size={16} aria-hidden />,
          onClick: onView,
        },
        {
          label: "Edit",
          icon: <PencilSimpleIcon size={16} aria-hidden />,
          hidden: () => !canManage,
          onClick: (r) => openEditModal(r),
        },
        {
          label: "Withdraw from use",
          icon: <ProhibitIcon size={16} aria-hidden />,
          color: "red",
          dividerBefore: true,
          hidden: (r) => !canManage || r.availability_status === "inactive",
          onClick: handleWithdraw,
        },
      ]}
    />
  );
}
