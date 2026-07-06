"use client";

import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper, ModuleHeader } from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { createGrant, fetchGrants } from "../grants.api";
import { grantsColumns } from "../grants.columns";
import { grantQueryKeys } from "../grants.queryKeys";
import type { Grant, GrantCreatePayload } from "../grants.types";
import { GrantForm } from "../form";

export function GrantsList() {
  return (
    <RequireStaff>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Grants", href: "/admin/authenticate/grants" },
        ]}
      />
      <ModalPaper withBorder>
        <ModalTableShell<Grant>
          queryKey={grantQueryKeys.list()}
          queryGetFn={fetchGrants}
          dataKey="data"
          paginationKey="meta"
          columns={grantsColumns}
          moduleInfo={{
            name: "grant",
            label: "Grants",
            description: "Direct permission grants for individual users",
          }}
          idAccessor="id"
          createFormComponent={GrantForm}
          onCreateApi={(values) => createGrant(values as GrantCreatePayload)}
          getErrorMessage={getApiErrorMessage}
          disableReviewButton
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>
    </RequireStaff>
  );
}
