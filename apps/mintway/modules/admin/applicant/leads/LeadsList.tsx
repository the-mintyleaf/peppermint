"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";

import { RequireAuth } from "@/components/RequireAuth";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { leadKeys } from "../_shared";
import type { DuplicateMatch } from "../_shared";
import { DuplicateWarningModal } from "../applicants/pages/list/components/DuplicateWarningModal";
import { ConvertLeadModal } from "./ConvertLeadModal";
import { LeadDetailModal } from "./LeadDetailModal";
import { LeadRowActions } from "./LeadRowActions";
import { LeadForm } from "./LeadForm";
import { leadColumns } from "./leads.columns";
import { createLead, fetchLeads, getLead, updateLead } from "./leads.api";
import type { Lead, LeadCreatePayload } from "./leads.types";
import type { LeadFormPayload } from "./LeadForm.types";

/**
 * `converted` is a documented list filter, and open enquiries are the working
 * set — so the default tab is the queue, not everything ever captured.
 */
const TABS: DataTableShellTab[] = [
  { label: "Open", icon: UsersThreeIcon, filter: { converted: "false" } },
  {
    label: "Converted",
    icon: CheckCircleIcon,
    filter: { converted: "true" },
  },
  { label: "All", icon: UserPlusIcon },
];

function LeadsListContent() {
  const [convertTarget, setConvertTarget] = useState<Lead | null>(null);
  const [viewTarget, setViewTarget] = useState<Lead | null>(null);
  const [dupMatches, setDupMatches] = useState<DuplicateMatch[] | null>(null);

  return (
    <>
      <ModalTableShell<Lead, LeadFormPayload, LeadFormPayload>
        queryKey={leadKeys.lists()}
        queryGetFn={fetchLeads}
        enableServerQuery
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={[
          ...leadColumns,
          {
            accessor: "actions",
            title: "",
            textAlign: "right",
            render: (l) => (
              <LeadRowActions
                lead={l}
                onView={setViewTarget}
                onConvert={setConvertTarget}
              />
            ),
          },
        ]}
        moduleInfo={{
          name: "lead",
          label: "Leads",
          description: "Enquiries captured before an applicant exists",
        }}
        createModalTitle="New lead"
        editModalTitle="Edit lead"
        modalWidth={720}
        createFormComponent={LeadForm}
        editFormComponent={LeadForm}
        // No row selection. Whether a lead may be edited is a *per-row* question
        // — a converted one is frozen and PATCHing it 409s — and the selection
        // toolbar's Edit button has no per-row guard, so it would bypass the one
        // in LeadRowActions. Editing goes through the row menu, which checks.
        disableActions
        // The list projection is the full record, but re-reading before edit keeps
        // record_version fresh so a concurrent edit conflicts instead of winning.
        onEditTrigger={(record) => getLead(record.id)}
        onCreateApi={(values) => createLead(values as LeadCreatePayload)}
        onEditApi={(values, record) =>
          updateLead(record.id, {
            ...values,
            record_version: record.record_version,
          })
        }
        getErrorMessage={getApiErrorMessage}
        disableReviewButton
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        tabs={TABS}
        basePath="/admin/leads"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
      />

      {convertTarget && (
        <ConvertLeadModal
          lead={convertTarget}
          opened
          onClose={() => setConvertTarget(null)}
          onDuplicates={setDupMatches}
        />
      )}

      <LeadDetailModal lead={viewTarget} onClose={() => setViewTarget(null)} />

      <DuplicateWarningModal
        matches={dupMatches}
        onClose={() => setDupMatches(null)}
      />
    </>
  );
}

/**
 * The enquiry funnel. Staff own capture and refinement — this is their entry
 * point now that applicant create is admin-only — and admins convert from here.
 */
export function LeadsList() {
  return (
    <RequireAuth>
      <LeadsListContent />
    </RequireAuth>
  );
}
