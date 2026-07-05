"use client";

import { useParams } from "next/navigation";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";
import { ModalTableShell } from "@peppermint/admin";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { DelegationForm } from "../../form";
import type { DelegationFormValues } from "../../form";
import { createDelegation, fetchDelegations } from "../../delegations.api";
import type { CreateDelegationPayload } from "../../delegations.api";
import { delegationsQueryKeys } from "../../delegations.queryKeys";
import type { AuthorityDelegation } from "../../delegations.types";
import { getDelegationsColumns } from "./delegations.columns";

function DelegationsListContent() {
  const { orgId = "" } = useParams<{ orgId: string }>();
  const columns = getDelegationsColumns();

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Organization", href: "/admin/organization" },
          { label: "Delegations", href: "#" },
        ]}
      />
      <ModalPaper withBorder>
        <ModalTableShell<AuthorityDelegation>
          queryKey={delegationsQueryKeys.list(orgId)}
          queryGetFn={(params) => fetchDelegations(orgId, params)}
          dataKey="data"
          paginationKey="meta"
          columns={columns}
          moduleInfo={{
            name: "delegation",
            label: "Delegations",
            description: "Temporary authority transfers between assignments",
          }}
          idAccessor="id"
          createFormComponent={DelegationForm}
          onCreateApi={(values) => {
            const formValues = values as unknown as DelegationFormValues;
            const payload: CreateDelegationPayload = {
              from_assignment_id: formValues.from_assignment_id as string,
              to_assignment_id: formValues.to_assignment_id as string,
              delegation_type:
                formValues.delegation_type as CreateDelegationPayload["delegation_type"],
              scope_unit: formValues.scope_unit,
              starts_at: formValues.starts_at,
              ends_at: formValues.ends_at || undefined,
              reason: formValues.reason,
            };
            return createDelegation(orgId, payload);
          }}
          getErrorMessage={getApiErrorMessage}
          disableReviewButton
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>
    </>
  );
}

export function DelegationsList() {
  return (
    <RequireStaff>
      <DelegationsListContent />
    </RequireStaff>
  );
}
