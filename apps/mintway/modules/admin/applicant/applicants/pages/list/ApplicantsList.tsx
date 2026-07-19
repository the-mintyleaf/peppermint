"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { UserCheckIcon } from "@phosphor-icons/react/dist/csr/UserCheck";

import { RequireAuth } from "@/components/RequireAuth";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  applicantKeys,
  createApplicant,
  fetchApplicants,
  getApplicant,
  updateApplicant,
} from "../../../_shared";
import type { Applicant, DuplicateMatch } from "../../../_shared";
import { ApplicantForm, ApplicantEditForm } from "../../form";
import { toCreatePayload, toUpdatePayload } from "../../form";
import type { ApplicantFormValues } from "../../form";
import { ApplicantProfileProvider } from "../../components/ApplicantProfileModal";
import { getApplicantColumns } from "./applicants.columns";
import { DuplicateWarningModal } from "./components/DuplicateWarningModal";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: UsersThreeIcon },
  {
    label: "Interested",
    icon: SparkleIcon,
    filter: { lifecycle_stage: "interested" },
  },
  {
    label: "Potential",
    icon: TrendUpIcon,
    filter: { lifecycle_stage: "potential" },
  },
  {
    label: "Applicants",
    icon: UserCheckIcon,
    filter: { lifecycle_stage: "applicant" },
  },
];

function ApplicantsListContent() {
  const { isAdmin } = useCurrentUser();
  const [dupMatches, setDupMatches] = useState<DuplicateMatch[] | null>(null);

  const columns = getApplicantColumns(isAdmin);

  return (
    <ApplicantProfileProvider>
      <ModalTableShell<Applicant, ApplicantFormValues, ApplicantFormValues>
        queryKey={applicantKeys.lists()}
        queryGetFn={fetchApplicants}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        // Dim locked applicants so their inactive/read-only state reads at a glance.
        rowStyle={(a) =>
          a.is_locked
            ? { backgroundColor: "var(--mantine-color-gray-light)" }
            : {}
        }
        moduleInfo={{
          name: "applicant",
          label: "Applicants",
          description: "Leads and applicants across the funnel",
        }}
        createModalTitle="New applicant"
        editModalTitle="Edit applicant"
        modalWidth={720}
        createFormComponent={ApplicantForm}
        editFormComponent={ApplicantEditForm}
        // The staff list projection omits record_version + protected fields, so
        // fetch the full record before editing (needed for the mandatory
        // record_version and a complete prefill).
        onEditTrigger={(record) => getApplicant(record.id)}
        onCreateApi={(values) =>
          createApplicant(toCreatePayload(values, isAdmin)).then(
            ({ data, meta }) => {
              if (meta.possible_duplicate && meta.matches?.length) {
                setDupMatches(meta.matches);
              }
              return data;
            },
          )
        }
        onEditApi={(values, record) =>
          updateApplicant(
            record.id,
            toUpdatePayload(values, isAdmin, record.record_version),
          )
        }
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={TABS}
        basePath="/admin/applicants"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      <DuplicateWarningModal
        matches={dupMatches}
        onClose={() => setDupMatches(null)}
      />
    </ApplicantProfileProvider>
  );
}

/** Applicants list — staff-reachable (restricted projection); admin sees the full set. */
export function ApplicantsList() {
  return (
    <RequireAuth>
      <ApplicantsListContent />
    </RequireAuth>
  );
}
