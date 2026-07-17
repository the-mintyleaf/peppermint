"use client";

import { createListModule } from "@/components/createListModule";

import { createGrant, fetchGrants } from "../grants.api";
import { grantsColumns } from "../grants.columns";
import { grantQueryKeys } from "../grants.queryKeys";
import type { Grant, GrantCreatePayload } from "../grants.types";
import type { GrantFormValues } from "../form/GrantForm.types";
import { GrantForm } from "../form";

export const GrantsList = createListModule<Grant, GrantFormValues>({
  basePath: "/admin/authenticate/grants",
  queryKey: grantQueryKeys.list(),
  queryGetFn: fetchGrants,
  columns: grantsColumns,
  moduleInfo: {
    name: "grant",
    label: "Grants",
    description: "Direct permission grants for individual users",
  },
  createFormComponent: GrantForm,
  onCreateApi: (values) => createGrant(values as GrantCreatePayload),
  disableReviewButton: true,
});
