"use client";

import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import {
  openReasonConfirmModal,
  RowActionsMenu,
  useModalTableShellContext,
} from "@peppermint/admin";
import { useWithdrawInstitution } from "../../../../institutions.hooks";
import type { Institution } from "../../../../institutions.types";

interface InstitutionRowActionsProps {
  institution: Institution;
  canManage: boolean;
  onManageCampuses: (institution: Institution) => void;
}

export function InstitutionRowActions({
  institution,
  canManage,
  onManageCampuses,
}: InstitutionRowActionsProps) {
  const withdraw = useWithdrawInstitution();
  const { openEditModal } = useModalTableShellContext<Institution>();

  const handleWithdraw = (record: Institution) =>
    openReasonConfirmModal({
      title: "Withdraw institution",
      parentLabel: "Institutions",
      tone: "danger",
      alertTitle:
        "This drops the provider and its programs from the default search",
      description: "Nothing is deleted — you can restore it later.",
      confirmLabel: "Withdraw",
      confirmColor: "red",
      onConfirm: async (reason) => {
        await withdraw.mutateAsync({ id: record.id, note: reason });
      },
    });

  return (
    <RowActionsMenu<Institution>
      record={institution}
      actions={[
        {
          label: "Manage campuses",
          icon: <BuildingsIcon size={16} aria-hidden />,
          onClick: onManageCampuses,
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
