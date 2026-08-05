"use client";

import { DataTableShell } from "@peppermint/admin";
import { ModalPaper } from "@peppermint/ui";
import { RequireCapability } from "@/components/RequireCapability";
import { fetchJourneysAwaitingChecklist } from "../../checklists.api";
import { awaitingChecklistKey } from "../../checklists.queryKeys";
import type { JourneyAwaitingChecklist } from "../../checklists.types";
import { AWAITING_SETUP_COLUMNS } from "./awaitingSetup.columns";

/**
 * The safety net (`?journey_missing_checklist=true`, §7) — journeys whose
 * destination country has no authored checklist yet, so the silence of
 * automatic inheritance stays visible. A DISTINCT view from the worklist
 * above, not a tab on it: the rows are a different resource entirely
 * (`JourneyAwaitingChecklist`, journeys — not checklists) and this list is
 * read-only guidance, never actionable from here.
 */
function AwaitingSetupListContent() {
  return (
    <DataTableShell<JourneyAwaitingChecklist>
      queryKey={awaitingChecklistKey()}
      queryGetFn={fetchJourneysAwaitingChecklist}
      dataKey="data"
      paginationKey="meta"
      enableServerQuery
      columns={AWAITING_SETUP_COLUMNS}
      moduleInfo={{
        name: "checklist-awaiting-setup",
        label: "Awaiting setup",
        description:
          "Journeys whose destination has no authored checklist yet — author the country's template, or re-save the journey once one exists",
      }}
      disableCreateButton
      disableReviewButton
      pageSizes={[10, 20, 50, 100]}
      defaultPageSize={20}
      mainComponent={ModalPaper}
      mainComponentProps={{ withBorder: true }}
    />
  );
}

export function ModuleAwaitingSetupList() {
  return (
    <RequireCapability capability="checklists">
      <AwaitingSetupListContent />
    </RequireCapability>
  );
}
