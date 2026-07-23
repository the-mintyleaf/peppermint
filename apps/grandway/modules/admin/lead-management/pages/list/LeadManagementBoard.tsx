"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { ActionIcon, Alert, ModalPaper, TextInput } from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { LeadForm } from "../../form";
import { CATEGORY_LABELS } from "../../leadCategory.utils";
import { createLead, getLead, updateLead } from "../../leadManagement.api";
import { useLeadBoardData, useLeadSources } from "../../leadManagement.hooks";
import type {
  LeadBoardRow,
  LeadCategory,
  LeadCreatePayload,
  LeadUpdatePayload,
} from "../../leadManagement.types";
import { getLeadManagementColumns } from "./leadManagement.columns";

const CATEGORY_ICONS: Record<
  LeadCategory,
  React.ComponentType<{ size?: number }>
> = {
  active: TrendUpIcon,
  needs_attention: WarningIcon,
  upcoming: CalendarCheckIcon,
  dead: ProhibitIcon,
};

/**
 * The backend rejects *any* PATCH whose body includes an inactive `source`,
 * even when it's unchanged — there's no "same value, don't re-validate"
 * exemption. `LeadForm` always emits a complete payload (it has no way to
 * know the record's original source is now retired), so the board — which
 * has the original record to compare against — drops `source` entirely when
 * it wasn't touched and is inactive, letting the PATCH proceed without
 * forcing an unrelated edit to also mean "pick a new source."
 */
function toUpdatePayload(
  values: LeadCreatePayload,
  record: LeadBoardRow,
): LeadUpdatePayload {
  if (values.source === record.source.id && !record.source.is_active) {
    const rest: LeadUpdatePayload = { ...values };
    delete rest.source;
    return rest;
  }
  return values;
}

function LeadManagementBoardContent() {
  const { isLeadManager } = useCurrentUser();
  const [fiscalYearInput, setFiscalYearInput] = useState("");
  const [fiscalYear, setFiscalYear] = useState<string | null>(null);

  const { counts, capped, isLoading, boardQueryKey, queryFn } =
    useLeadBoardData(fiscalYear);
  const { data: sources = [] } = useLeadSources();

  const columns = getLeadManagementColumns({ sources });

  const tabs: DataTableShellTab[] = (
    Object.keys(CATEGORY_LABELS) as LeadCategory[]
  ).map((category) => ({
    label: `${CATEGORY_LABELS[category]} · ${counts[category]}`,
    icon: CATEGORY_ICONS[category],
    filter: { category },
  }));

  const applyFiscalYear = () => {
    const trimmed = fiscalYearInput.trim();
    setFiscalYear(trimmed || null);
  };

  const clearFiscalYear = () => {
    setFiscalYearInput("");
    setFiscalYear(null);
  };

  return (
    <>
      <ModalTableShell<LeadBoardRow, LeadCreatePayload, LeadCreatePayload>
        queryKey={boardQueryKey}
        queryGetFn={queryFn}
        enableServerQuery={false}
        dataKey="data"
        paginationKey="meta"
        idAccessor="id"
        columns={columns}
        tabs={tabs}
        moduleInfo={{
          name: "lead",
          label: "Leads",
          description: isLeadManager
            ? "Your assigned leads"
            : "All leads across the team",
        }}
        createModalTitle="Add lead"
        editModalTitle="Edit lead"
        modalWidth={640}
        createFormComponent={LeadForm}
        editFormComponent={LeadForm}
        onCreateApi={(values) => createLead(values)}
        onEditApi={(values, record) =>
          updateLead(record.id, toUpdatePayload(values, record))
        }
        onEditTrigger={async (record) => ({
          ...(await getLead(record.id)),
          category: record.category,
        })}
        disableReviewButton
        getErrorMessage={getApiErrorMessage}
        pageSizes={[10, 20, 30, 50]}
        defaultPageSize={20}
        basePath="/admin/lead-management"
        mainComponent={ModalPaper}
        mainComponentProps={{ withBorder: true }}
        headerRight={
          <TextInput
            size="xs"
            placeholder="e.g. 2081/82"
            description="Nepali fiscal year"
            value={fiscalYearInput}
            onChange={(e) => setFiscalYearInput(e.currentTarget.value)}
            onBlur={applyFiscalYear}
            onKeyDown={(e) => {
              if (e.key === "Enter") applyFiscalYear();
            }}
            rightSection={
              fiscalYear ? (
                <ActionIcon
                  variant="subtle"
                  size="sm"
                  aria-label="Clear fiscal year filter"
                  onClick={clearFiscalYear}
                >
                  <XIcon size={14} aria-hidden />
                </ActionIcon>
              ) : null
            }
            w={160}
          />
        }
      />

      {!isLoading && capped ? (
        <Alert
          variant="light"
          color="yellow"
          icon={<WarningIcon size={16} aria-hidden />}
          title="Showing a partial view"
          mt="md"
        >
          This account has more leads than this dashboard loads at once. Narrow
          by fiscal year to see the rest.
        </Alert>
      ) : null}
    </>
  );
}

export function ModuleLeadManagement() {
  return (
    <RequireLeadAccess>
      <LeadManagementBoardContent />
    </RequireLeadAccess>
  );
}
