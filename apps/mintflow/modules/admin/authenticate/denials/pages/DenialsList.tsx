"use client";

import { createListModule } from "@/components/createListModule";

import { createDenial, fetchDenials } from "../denials.api";
import { denialsColumns } from "../denials.columns";
import { denialQueryKeys } from "../denials.queryKeys";
import type { Denial, DenialCreatePayload } from "../denials.types";
import type { DenialFormValues } from "../form/DenialForm.types";
import { DenialForm } from "../form";

export const DenialsList = createListModule<Denial, DenialFormValues>({
  breadcrumb: [{ label: "Denials", href: "/admin/authenticate/denials" }],
  queryKey: denialQueryKeys.list(),
  queryGetFn: fetchDenials,
  columns: denialsColumns,
  moduleInfo: {
    name: "denial",
    label: "Denials",
    description: "Direct permission denials for individual users",
  },
  createFormComponent: DenialForm,
  onCreateApi: (values) => createDenial(values as DenialCreatePayload),
  disableReviewButton: true,
});
