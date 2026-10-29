"use client";

import { useCallback, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { useDeepLinkSearch } from "@/lib/useDeepLinkSearch";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import {
  LeadForm,
  LeadFormSubmitErrorContext,
  useLeadFormSubmitErrorChannel,
} from "../../form";
import { useLeadAccess } from "../../leadAccess.hooks";
import { CATEGORY_LABELS } from "../../leadCategory.utils";
import { createLead, getLead, updateLead } from "../../leadManagement.api";
import {
  useLeadBoardData,
  useLeadSources,
  useRefreshLead,
  useRefreshOnStaleLead,
} from "../../leadManagement.hooks";
import { ReferenceDataModal } from "../../reference-data";
import type {
  LeadBoardRow,
  LeadCategory,
  LeadCreatePayload,
  LeadListFilters,
  LeadUpdatePayload,
} from "../../leadManagement.types";
import { DeletedLeadsModal } from "./components/DeletedLeadsModal";
import { LeadDetailDrawer } from "./components/LeadDetailDrawer";
import { LeadProfileFilters } from "./components/LeadProfileFilters";
import { getLeadManagementColumns } from "./leadManagement.columns";

/** `?lead=<id>` — the open drawer. Notifications deep-link here (`notifications.utils.ts`). */
const LEAD_PARAM = "lead";

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

/**
 * The open lead lives in the URL (`?lead=<id>`), not component state — the
 * same convention as `ChecklistTemplatesList`'s `?template=`. A notification
 * link can land here while the board is already mounted, so reading the param
 * every render is the only way the drawer reliably follows it; opening and
 * closing rewrite just that param (`replace`, so Back still leaves the board)
 * and leave `?q=` and the shell's own params untouched.
 */
function useOpenLeadParam() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const openLeadId = searchParams.get(LEAD_PARAM)?.trim() || null;

  const setOpenLeadId = useCallback(
    (leadId: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (leadId) next.set(LEAD_PARAM, leadId);
      else next.delete(LEAD_PARAM);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, pathname, router],
  );

  return { openLeadId, setOpenLeadId };
}

function LeadManagementBoardContent() {
  const { isLeadManager } = useCurrentUser();
  const { isLeadAdmin } = useLeadAccess();
  // A leads hit in the global spotlight lands here carrying the matched name —
  // leads open in a drawer, not on a route of their own.
  const deepLinkSearch = useDeepLinkSearch();
  const { openLeadId, setOpenLeadId } = useOpenLeadParam();
  const [fiscalYearInput, setFiscalYearInput] = useState("");
  const [fiscalYear, setFiscalYear] = useState<string | null>(null);
  const [profileFilters, setProfileFilters] = useState<LeadListFilters>({});
  const [referenceDataOpen, setReferenceDataOpen] = useState(false);
  const [deletedLeadsOpen, setDeletedLeadsOpen] = useState(false);
  const { submitError, captureSubmitError } = useLeadFormSubmitErrorChannel();
  const refreshLead = useRefreshLead();
  const refreshOnStale = useRefreshOnStaleLead();

  const { capped, isLoading, boardQueryKey, queryFn } = useLeadBoardData(
    fiscalYear,
    profileFilters,
  );
  const { data: sources = [] } = useLeadSources();

  const columns = getLeadManagementColumns({
    sources,
    onViewDetails: (lead) => setOpenLeadId(lead.id),
  });

  // "All leads" carries no `filter` — the shell resets filters on every tab
  // switch, so an unfiltered tab is the whole loaded set.
  const tabs: DataTableShellTab[] = [
    { label: "All leads" },
    ...(Object.keys(CATEGORY_LABELS) as LeadCategory[]).map((category) => ({
      label: CATEGORY_LABELS[category],
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
    <LeadFormSubmitErrorContext.Provider value={submitError}>
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
        // `captureSubmitError` hands a rejection's field details to the open
        // form (`LeadFormSubmitErrorContext`) and rethrows, so the shell still
        // toasts and keeps the modal open. The shell itself only invalidates
        // `boardQueryKey` — the CURRENT scope — so a filtered board would
        // leave the unscoped dashboard queries and the lead's detail stale;
        // `refreshLead` invalidates `lists()` (every scope) + `detail(id)`,
        // on success and on a stale-lead 409 (deleted/converted meanwhile).
        onCreateApi={async (values) => {
          const created = await captureSubmitError(createLead(values));
          refreshLead(created.id);
          return created;
        }}
        onEditApi={async (values, record) => {
          try {
            const updated = await captureSubmitError(
              updateLead(record.id, toUpdatePayload(values, record)),
            );
            refreshLead(record.id);
            return updated;
          } catch (error) {
            refreshOnStale(error, record.id);
            throw error;
          }
        }}
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
          <Group gap="xs" align="flex-end" wrap="wrap">
            {isLeadAdmin ? (
              <>
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<TagIcon size={14} aria-hidden />}
                  onClick={() => setReferenceDataOpen(true)}
                >
                  Manage sources
                </Button>
                <Button
                  size="xs"
                  variant="default"
                  leftSection={<TrashIcon size={14} aria-hidden />}
                  onClick={() => setDeletedLeadsOpen(true)}
                >
                  Deleted leads
                </Button>
              </>
            ) : null}
            <LeadProfileFilters
              value={profileFilters}
              onChange={setProfileFilters}
            />
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
          by fiscal year or profile to see the rest.
        </Alert>
      ) : null}

      <LeadDetailDrawer
        leadId={openLeadId}
        opened={openLeadId !== null}
        onClose={() => setOpenLeadId(null)}
      />

      {isLeadAdmin ? (
        <>
          <ReferenceDataModal
            opened={referenceDataOpen}
            onClose={() => setReferenceDataOpen(false)}
          />
          <DeletedLeadsModal
            opened={deletedLeadsOpen}
            onClose={() => setDeletedLeadsOpen(false)}
            onViewLead={setOpenLeadId}
          />
        </>
      ) : null}
    </LeadFormSubmitErrorContext.Provider>
  );
}

export function ModuleLeadManagement() {
  return (
    <RequireLeadAccess>
      <LeadManagementBoardContent />
    </RequireLeadAccess>
  );
}
