"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Center,
  ModalPaper,
  Stack,
  Text,
  ThemeIcon,
  Title,
  useDebouncedValue,
  useQuery,
} from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import type { QueryParams } from "@peppermint/admin";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { documentQueryKeys, documentsApi } from "@/modules/documents";
import type { Document, DocumentSearchParams } from "@/modules/documents";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { QueryErrorState } from "@/components/QueryErrorState";
import { DocumentSearchCriteria } from "./DocumentSearchCriteria";
import { getDocumentSearchColumns } from "./documentSearch.columns";
import {
  EMPTY_SEARCH_CRITERIA,
  type ApplicantIndex,
  type DocumentSearchCriteriaValues,
  type DocumentSearchPanelProps,
} from "./DocumentSearchPanel.types";

/** Table accessor → backend ordering field. Unmapped columns are simply not sortable. */
const ORDERING_FIELDS: Record<string, string> = {
  label: "label",
  status: "status",
  updatedAt: "updated_at",
  createdAt: "created_at",
};

/** `[{field:"updatedAt",direction:"desc"}]` → `-updated_at`; `""` lets the API layer default. */
function toOrdering(sort: QueryParams["sort"]): string {
  return sort
    .map((entry) => {
      const field = ORDERING_FIELDS[entry.field];
      if (!field) return null;
      return entry.direction === "desc" ? `-${field}` : field;
    })
    .filter((entry): entry is string => entry !== null)
    .join(",");
}

/** Trimmed, blank-free criteria — also the object that seeds the query key. */
function toSearchParams(
  criteria: DocumentSearchCriteriaValues,
): DocumentSearchParams {
  return {
    applicant: criteria.applicant.trim() || undefined,
    label: criteria.label.trim() || undefined,
    type: criteria.type ?? undefined,
    status: criteria.status ?? undefined,
    templateVersion: criteria.templateVersion.trim() || undefined,
    applicationCaseId: criteria.applicationCaseId.trim() || undefined,
    createdFrom: criteria.createdFrom ?? undefined,
    createdTo: criteria.createdTo ?? undefined,
    updatedFrom: criteria.updatedFrom ?? undefined,
    updatedTo: criteria.updatedTo ?? undefined,
  };
}

function hasAnyCriteria(params: DocumentSearchParams): boolean {
  return Object.values(params).some((value) => value !== undefined);
}

/**
 * Cross-applicant document search (`GET /api/v1/documents/search/`).
 *
 * Answers one question: "where is this document, across every applicant?" The criteria bar
 * owns all ten documented query params; the results table is a server-paginated
 * `DataTableShell`, so page size and ordering are always sent explicitly (the endpoint's
 * defaults are an open contract gap).
 *
 * Renders inside the list module's `RequireDocumentAccess` gate — staff never reach it, and
 * they see the app's not-found treatment rather than a "forbidden" panel that would confirm
 * the surface exists.
 *
 * States: no criteria yet → an orienting prompt (not a dead end); loading → the shell's
 * fetching overlay; no matches → the shell's empty state; request failed → a retryable
 * alert in place of the table; permission denied → handled by the gate above.
 */
export function DocumentSearchPanel({ onBack }: DocumentSearchPanelProps) {
  const router = useRouter();
  const [criteria, setCriteria] = useState<DocumentSearchCriteriaValues>(
    EMPTY_SEARCH_CRITERIA,
  );
  // The failure is tagged with the criteria that produced it, so a changed query drops a
  // stale error by derivation rather than by resetting state from an effect.
  const [failure, setFailure] = useState<{ key: string; error: Error } | null>(
    null,
  );
  const [retryToken, setRetryToken] = useState(0);

  // Typing shouldn't fire a request per keystroke; the shell's own debounce only covers its
  // toolbar, which this surface replaces.
  const [debouncedCriteria] = useDebouncedValue(criteria, 300);

  const searchParams = useMemo(
    () => toSearchParams(debouncedCriteria),
    [debouncedCriteria],
  );
  const hasCriteria = hasAnyCriteria(searchParams);
  const criteriaKey = JSON.stringify(searchParams);
  const error = failure?.key === criteriaKey ? failure.error : null;

  /**
   * Applicant names are best-effort: `documents/search/` returns `applicant` as a bare UUID,
   * so identity is resolved from the already-cached workspaces list. A miss degrades to the
   * short id rather than blocking the row.
   */
  const { data: workspaces } = useQuery({
    queryKey: documentQueryKeys.workspaces(),
    queryFn: () => documentsApi.listWorkspaces(),
    staleTime: 60_000,
  });

  const applicantIndex = useMemo<ApplicantIndex>(() => {
    const index: ApplicantIndex = new Map();
    for (const workspace of workspaces ?? []) {
      index.set(workspace.applicantId, {
        name: workspace.applicantName,
        code: workspace.applicantCode,
      });
    }
    return index;
  }, [workspaces]);

  const columns = useMemo(
    () =>
      getDocumentSearchColumns({
        applicantIndex,
        onOpenEditor: (applicantId) => router.push(`/documents/${applicantId}`),
      }),
    [applicantIndex, router],
  );

  const queryGetFn = useCallback(
    (params?: QueryParams) =>
      documentsApi.search({
        ...searchParams,
        page: params?.page,
        pageSize: params?.pageSize,
        ordering: params ? toOrdering(params.sort) : undefined,
      }),
    [searchParams],
  );

  const backButton = (
    <Button
      size="xs"
      variant="subtle"
      leftSection={<ArrowLeftIcon size={14} aria-hidden />}
      onClick={onBack}
    >
      Back to workspaces
    </Button>
  );

  return (
    <Box>
      <DocumentSearchCriteria
        value={criteria}
        onChange={setCriteria}
        onClear={() => setCriteria(EMPTY_SEARCH_CRITERIA)}
        hasCriteria={hasAnyCriteria(toSearchParams(criteria))}
      />

      {!hasCriteria ? (
        <ModalPaper withBorder>
          <Center py="xl" px="md">
            <Stack align="center" gap="xs" maw={460}>
              <ThemeIcon size={48} radius="xl" variant="light" color="gray">
                <MagnifyingGlassIcon size={24} aria-hidden />
              </ThemeIcon>
              <Title order={4} ta="center">
                Search documents across all applicants
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                Start with an applicant name or code, or a document label. Use
                “More filters” to narrow by template version, linked case, or
                when the document was created or last updated.
              </Text>
              {backButton}
            </Stack>
          </Center>
        </ModalPaper>
      ) : error ? (
        <ModalPaper withBorder>
          <Box p="md">
            <QueryErrorState
              message={getApiErrorMessage(error)}
              onRetry={() => {
                setFailure(null);
                setRetryToken((token) => token + 1);
              }}
            />
          </Box>
        </ModalPaper>
      ) : (
        <DataTableShell<Document>
          // Remount on a criteria change so the table's page resets to 1. Page lives
          // in the wrapper's own store, which criteria bypass entirely — without
          // this, narrowing a search while on page 4 refetches page 4 of a
          // one-page result and shows the empty state for a search that matched.
          // Losing the sort on remount is the lesser cost.
          key={criteriaKey}
          // The retry counter stays in the key so Retry refetches without remounting.
          queryKey={[
            ...documentQueryKeys.search(searchParams),
            String(retryToken),
          ]}
          queryGetFn={queryGetFn}
          enableServerQuery
          dataKey="data"
          paginationKey="meta"
          idAccessor="id"
          columns={columns}
          onError={(nextError) =>
            setFailure({ key: criteriaKey, error: nextError })
          }
          moduleInfo={{
            name: "document-search",
            label: "Document search",
            description: "Matching documents across all applicants",
          }}
          basePath="/admin/documents"
          hideToolbar
          disableActions
          disableCreateButton
          headerRight={backButton}
          pageSizes={[10, 20, 50, 100]}
          defaultPageSize={20}
          mainComponent={ModalPaper}
          mainComponentProps={{ withBorder: true }}
        />
      )}
    </Box>
  );
}
