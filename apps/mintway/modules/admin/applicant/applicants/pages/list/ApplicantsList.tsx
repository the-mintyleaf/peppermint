"use client";

import { useRef, useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { UserCheckIcon } from "@phosphor-icons/react/dist/csr/UserCheck";
import { ArchiveIcon } from "@phosphor-icons/react/dist/csr/Archive";

import { RequireAuth } from "@/components/RequireAuth";
import {
  ClientPreconditionError,
  getApiErrorMessage,
} from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  applicantKeys,
  createApplicant,
  fetchApplicants,
  getApplicant,
  updateApplicant,
} from "../../../_shared";
import type {
  Applicant,
  ApplicantListRow,
  DuplicateMatch,
} from "../../../_shared";
import { ApplicantForm, ApplicantEditForm } from "../../form";
import { toCreatePayload, toUpdatePayload } from "../../form";
import type { ApplicantFormValues } from "../../form";
import { ApplicantProfileProvider } from "../../components/ApplicantProfileModal";
import { getApplicantColumns } from "./applicants.columns";
import { DuplicateWarningModal } from "./components/DuplicateWarningModal";

const BASE_TABS: DataTableShellTab[] = [
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

/**
 * Archived applicants are excluded from every list unless `include_archived` is sent,
 * and that param is admin-only. Without this tab the Archive action was a one-way
 * door: the record left the list and nothing in the UI could bring it back.
 */
const ARCHIVED_TAB: DataTableShellTab = {
  label: "Archived",
  icon: ArchiveIcon,
  filter: { include_archived: "true", engagement_status: "archived" },
};

function ApplicantsListContent() {
  const { isAdmin } = useCurrentUser();
  const [dupMatches, setDupMatches] = useState<DuplicateMatch[] | null>(null);
  // The full record fetched by onEditTrigger — the row itself has no record_version.
  const editRecordRef = useRef<Applicant | null>(null);

  const columns = getApplicantColumns(isAdmin);

  // include_archived is admin-only, so staff never see the Archived tab.
  const tabs = isAdmin ? [...BASE_TABS, ARCHIVED_TAB] : BASE_TABS;

  return (
    <ApplicantProfileProvider>
      <ModalTableShell<
        ApplicantListRow,
        ApplicantFormValues,
        ApplicantFormValues
      >
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
        // Applicant create is admin-only (Phase 7): staff capture enquiries as leads,
        // which an admin converts. The shell renders the create action whenever
        // `createFormComponent` is set, so withholding it is what hides the button —
        // otherwise staff get an action that always 403s.
        createFormComponent={isAdmin ? ApplicantForm : undefined}
        editFormComponent={ApplicantEditForm}
        // The list projection omits record_version + the protected fields, so the
        // full record is fetched before editing — needed both for the prefill and
        // for the mandatory record_version. It is stashed here rather than read
        // back off the row: the row is an ApplicantListRow and genuinely has no
        // version on it, which is now a compile error rather than a silent
        // `undefined` in the request body.
        onEditTrigger={async (record) => {
          const full = await getApplicant(record.id);
          editRecordRef.current = full;
          return full;
        }}
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
        onEditApi={(values, record) => {
          const full = editRecordRef.current;
          if (!full || full.id !== record.id) {
            throw new ClientPreconditionError(
              "Applicant not loaded — reopen the record and try again.",
            );
          }
          return updateApplicant(
            record.id,
            toUpdatePayload(values, isAdmin, full.record_version),
          );
        }}
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={tabs}
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
