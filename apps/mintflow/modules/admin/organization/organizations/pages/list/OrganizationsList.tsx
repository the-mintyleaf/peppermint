"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
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
import { useSelectedOrgStore } from "@/stores/selectedOrg.store";
import { getOrganizationsColumns } from "./organizations.columns";

const TABS: DataTableShellTab[] = [
  { label: "All" },
  { label: "Active", filter: { status: "active" } },
  { label: "Draft", filter: { status: "draft" } },
  { label: "Inactive", filter: { status: "inactive" } },
  {
    label: "Suspended",
    filter: { status: "suspended" },
  },
  { label: "Archived", filter: { status: "archived" } },
];

type StatusChangeTarget = { org: Organization; newStatus: OrganizationStatus };

export function OrganizationsList() {
  const router = useRouter();
  const setOrg = useSelectedOrgStore((s) => s.setOrg);
  const [statusTarget, setStatusTarget] = useState<StatusChangeTarget | null>(
    null,
  );
  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeOrganizationStatus();

  const columns = useMemo(
    () =>
      getOrganizationsColumns(
        (org, newStatus) => setStatusTarget({ org, newStatus }),
        (org) => {
          setOrg({
            id: org.id,
            name: org.name,
            code: org.code,
            status: org.status,
            country_code: org.country_code,
          });
          router.push(`/admin/organization/${org.id}/structure`);
        },
      ),
    [router, setOrg],
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
