"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import { ModalPaper, useQueryClient } from "@peppermint/ui";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useDeepLinkSearch } from "@/lib/useDeepLinkSearch";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  createInstitution,
  fetchInstitutions,
  updateInstitution,
} from "../../../institutions.api";
import { useCountries } from "../../../institutions.hooks";
import {
  institutionQueryKeys,
  programQueryKeys,
} from "../../../institutions.queryKeys";
import type {
  Institution,
  InstitutionCreatePayload,
  InstitutionFormValues,
  InstitutionUpdatePayload,
} from "../../../institutions.types";
import { InstitutionForm } from "../../form/InstitutionForm";
import { CampusManager } from "./components/CampusManager";
import { getProvidersColumns } from "./providers.columns";

function toCreatePayload(v: InstitutionFormValues): InstitutionCreatePayload {
  return {
    country: v.country,
    name: v.name,
    common_name: v.common_name,
    institution_type: v.institution_type,
    availability_status: v.availability_status,
    availability_note: v.availability_note,
    notes: v.notes,
  };
}

/** `country` IS editable here — deliberately included (cascades to programs). */
function toUpdatePayload(v: InstitutionFormValues): InstitutionUpdatePayload {
  return toCreatePayload(v);
}

function InstitutionsListContent() {
  const { authorityType } = useCurrentUser();
  const canManage = authorityType === "admin";
  const queryClient = useQueryClient();
  const { data: countries = [] } = useCountries();
  const [campusInstitution, setCampusInstitution] =
    useState<Institution | null>(null);
  // Global-search deep link — institutions have no detail route either.
  const deepLinkSearch = useDeepLinkSearch();

  const columns = getProvidersColumns({
    countries,
    canManage,
    onManageCampuses: setCampusInstitution,
  });

  return (
    <>
      <ModalTableShell<
        Institution,
        InstitutionFormValues,
        InstitutionFormValues
      >
        queryKey={institutionQueryKeys.lists()}
        queryGetFn={fetchInstitutions}
        enableServerQuery
        initialSearch={deepLinkSearch}
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        moduleInfo={{
          name: "institution",
          label: "Institutions",
          description: "Providers the consultancy can offer programs at",
        }}
        createModalTitle="Add institution"
        editModalTitle="Edit institution"
        modalWidth={640}
        createFormComponent={canManage ? InstitutionForm : undefined}
        editFormComponent={canManage ? InstitutionForm : undefined}
        onCreateApi={(values) => createInstitution(toCreatePayload(values))}
        onEditApi={(values, record) =>
          updateInstitution(record.id, toUpdatePayload(values))
        }
        onEditSuccess={() => {
          // Editing an institution's country/availability cascades to its
          // programs' derived country and to the chain-aware program search.
          void queryClient.invalidateQueries({
            queryKey: programQueryKeys.lists(),
          });
        }}
        disableReviewButton
        getErrorMessage={getApiErrorMessage}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/institutions/providers"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <CampusManager
        institution={campusInstitution}
        opened={campusInstitution !== null}
        onClose={() => setCampusInstitution(null)}
        canManage={canManage}
      />
    </>
  );
}

export function InstitutionsList() {
  return (
    <RequireLeadAccess>
      <InstitutionsListContent />
    </RequireLeadAccess>
  );
}
