"use client";

import { ModalTableShell } from "@peppermint/admin";
import { createDenial, fetchDenials } from "../denials.api";
import { denialsColumns } from "../denials.columns";
import { denialQueryKeys } from "../denials.queryKeys";
import type { Denial, DenialCreatePayload } from "../denials.types";
import { DenialForm } from "../form";

export function DenialsList() {
  return (
    <ModalTableShell<Denial>
      queryKey={denialQueryKeys.list()}
      queryGetFn={fetchDenials}
      dataKey="data"
      paginationKey="meta"
      columns={denialsColumns}
      moduleInfo={{
        name: "denial",
        label: "Denials",
        description: "Direct permission denials for individual users",
      }}
      idAccessor="id"
      createFormComponent={DenialForm}
      onCreateApi={(values) => createDenial(values as DenialCreatePayload)}
      disableReviewButton
      pageSizes={[10, 20, 30, 50]}
      defaultPageSize={20}
    />
  );
}
