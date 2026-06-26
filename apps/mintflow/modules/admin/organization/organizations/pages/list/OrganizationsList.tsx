"use client";

import { useMemo, useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { ReasonConfirmDialog } from "../../../_shared/ReasonConfirmDialog";
import { ORGANIZATION_STATUS_LABELS } from "../../../organization.constants";
import {
  createOrganization,
  deleteOrganization,
  fetchOrganizations,
  updateOrganization,
} from "../../organizations.api";
import { useChangeOrganizationStatus } from "../../organizations.hooks";
import { organizationsQueryKeys } from "../../organizations.queryKeys";
import type {
  Organization,
  OrganizationStatus,
} from "../../organizations.types";
import { OrganizationsForm } from "../../form/OrganizationsForm";
import { getOrganizationsColumns } from "./organizations.columns";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: BuildingsIcon },
  { label: "Active", icon: CheckCircleIcon, filter: { status: "active" } },
  { label: "Draft", icon: FileIcon, filter: { status: "draft" } },
  { label: "Inactive", icon: MinusCircleIcon, filter: { status: "inactive" } },
  {
    label: "Suspended",
    icon: WarningCircleIcon,
    filter: { status: "suspended" },
  },
  { label: "Archived", icon: ArchiveIcon, filter: { status: "archived" } },
];

type StatusChangeTarget = { org: Organization; newStatus: OrganizationStatus };

export function OrganizationsList() {
  const [statusTarget, setStatusTarget] = useState<StatusChangeTarget | null>(
    null,
  );
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeOrganizationStatus();

  const columns = useMemo(
    () =>
      getOrganizationsColumns((org, newStatus) =>
        setStatusTarget({ org, newStatus }),
      ),
    [],
  );

  function handleStatusConfirm(reason: string) {
    if (!statusTarget) return;
    changeStatus(
      {
        id: statusTarget.org.id,
        payload: { status: statusTarget.newStatus, reason },
      },
      { onSuccess: () => setStatusTarget(null) },
    );
  }

  return (
    <>
      <Paper
        p={0}
        withBorder
        radius="var(--mantine-radius-default)"
        h="calc(100vh - 16px)"
      >
        <ModalTableShell<Organization>
          queryKey={organizationsQueryKeys.list()}
          queryGetFn={fetchOrganizations}
          dataKey="data"
          paginationKey="meta"
          enableServerQuery
          columns={columns}
          moduleInfo={{
            name: "organizations",
            label: "Organizations",
            description: "Manage organizational entities",
          }}
          idAccessor="id"
          createFormComponent={OrganizationsForm}
          editFormComponent={OrganizationsForm}
          onCreateApi={(values) =>
            createOrganization(values as Partial<Organization>)
          }
          onEditApi={(values) => {
            const org = values as Organization;
            return updateOrganization(String(org.id), org);
          }}
          onDeleteApi={(id) => deleteOrganization(String(id))}
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
          tabs={TABS}
          basePath="/admin/organization"
        />
      </Paper>

      <ReasonConfirmDialog
        opened={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        title={`Set ${ORGANIZATION_STATUS_LABELS[statusTarget?.newStatus ?? "active"]}`}
        description={`This will change "${statusTarget?.org.name}" to ${ORGANIZATION_STATUS_LABELS[statusTarget?.newStatus ?? "active"]?.toLowerCase()} status.`}
        confirmLabel="Change Status"
        confirmColor={statusTarget?.newStatus === "archived" ? "red" : "blue"}
        onConfirm={handleStatusConfirm}
        loading={isChangingStatus}
      />
    </>
  );
}
