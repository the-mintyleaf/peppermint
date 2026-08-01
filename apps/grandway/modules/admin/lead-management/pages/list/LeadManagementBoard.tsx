"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import {
  ActionIcon,
  Alert,
  Button,
  Group,
  ModalPaper,
  TextInput,
} from "@peppermint/ui";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { TrendUpIcon } from "@phosphor-icons/react/dist/csr/TrendUp";
import { CalendarCheckIcon } from "@phosphor-icons/react/dist/csr/CalendarCheck";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { ListBulletsIcon } from "@phosphor-icons/react/dist/csr/ListBullets";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useDeepLinkSearch } from "@/lib/useDeepLinkSearch";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { LeadForm } from "../../form";
import { CATEGORY_LABELS } from "../../leadCategory.utils";
import { createLead, getLead, updateLead } from "../../leadManagement.api";
import { useLeadBoardData, useLeadSources } from "../../leadManagement.hooks";
import { ReferenceDataModal } from "../../reference-data";
import type {
  LeadBoardRow,
  LeadCategory,
  LeadCreatePayload,
  LeadUpdatePayload,
} from "../../leadManagement.types";
import { LeadDetailDrawer } from "./components/LeadDetailDrawer";
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
  const { isLeadManager, authorityType } = useCurrentUser();
  // A leads hit in the global spotlight lands here carrying the matched name —
  // leads open in a drawer, not on a route of their own.
  const deepLinkSearch = useDeepLinkSearch();
  const [fiscalYearInput, setFiscalYearInput] = useState("");
  const [fiscalYear, setFiscalYear] = useState<string | null>(null);
  const [referenceDataOpen, setReferenceDataOpen] = useState(false);

  const { rows, counts, capped, isLoading, boardQueryKey, queryFn } =
    useLeadBoardData(fiscalYear);
  const { data: sources = [] } = useLeadSources();
  const [detailLeadId, setDetailLeadId] = useState<string | null>(null);

  const columns = getLeadManagementColumns({
    sources,
    onViewDetails: (lead) => setDetailLeadId(lead.id),
  });

  // "All leads" carries no `filter` — the shell resets filters on every tab
  // switch, so an unfiltered tab is the whole loaded set. Its count is
  // `rows.length` (what the table actually holds), not `meta.total`, which can
  // be larger when the board is capped.
  const tabs: DataTableShellTab[] = [
    {
      label: `All leads · ${rows.length}`,
      icon: ListBulletsIcon,
    },
    ...(Object.keys(CATEGORY_LABELS) as LeadCategory[]).map((category) => ({
      label: `${CATEGORY_LABELS[category]} · ${counts[category]}`,
      icon: CATEGORY_ICONS[category],
      filter: { category },
    })),
  ];

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
        initialSearch={deepLinkSearch}
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
          <Group gap="xs" align="flex-end">
            {authorityType === "admin" ? (
              <Button
                size="xs"
                variant="default"
                leftSection={<TagIcon size={14} aria-hidden />}
                onClick={() => setReferenceDataOpen(true)}
              >
                Manage sources
              </Button>
            ) : null}
            <TextInput
              size="xs"
              placeholder="e.g. 2081/82"
              aria-label="Nepali fiscal year"
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
          </Group>
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

      <LeadDetailDrawer
        leadId={detailLeadId}
        opened={detailLeadId !== null}
        onClose={() => setDetailLeadId(null)}
      />

      {authorityType === "admin" ? (
        <ReferenceDataModal
          opened={referenceDataOpen}
          onClose={() => setReferenceDataOpen(false)}
        />
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
