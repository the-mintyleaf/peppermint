"use client";

import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  Button,
  Group,
  Loader,
  Spotlight,
  Text,
  useDebouncedValue,
  type SpotlightActionData,
  type SpotlightActionGroupData,
} from "@peppermint/ui";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { buildNavSpotlightTargets } from "../../../navSpotlight.utils";
import type {
  AdminShellGlobalSearch,
  AdminShellMainNavAdditional,
  AdminShellMainNavItem,
  AdminShellSearchResult,
} from "../../../AdminShell.types";

/**
 * `@mantine/spotlight` exports the two halves but not their union (it is only
 * reachable as `Spotlight.ActionData | Spotlight.ActionGroupData`), so the
 * mixed-list type the `actions` prop takes is spelled out here.
 */
type SpotlightActions = SpotlightActionData | SpotlightActionGroupData;

interface MainNavSpotlightProps {
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  globalSearch?: AdminShellGlobalSearch;
  onNavigate?: (href: string) => void;
}

const DEFAULT_MIN_QUERY_LENGTH = 2;
const DEFAULT_DEBOUNCE_MS = 250;
const DEFAULT_STALE_TIME_MS = 30_000;
const DEFAULT_NAV_RESULT_LIMIT = 4;
/** Nav-only ceiling — with no records competing for the list, show more jumps. */
const NAV_ONLY_LIMIT = 10;

/**
 * The sidebar spotlight. Two sources feed one list:
 *
 * 1. **Navigation targets** — derived from the nav config, filtered in-memory
 *    against the live (undebounced) query so a module jump never waits on a
 *    network round trip.
 * 2. **Records** — whatever `globalSearch.search` returns for the debounced
 *    query, already server-filtered.
 *
 * Because the two are filtered differently, `filter` is a pass-through and the
 * final list is assembled here: applying Mantine's default filter to remote
 * results would re-filter server matches against the raw query and drop rows
 * that matched on a field the label doesn't show (an email, a passport number).
 */
export function MainNavSpotlight({
  mainNav,
  additional,
  globalSearch,
  onNavigate,
}: MainNavSpotlightProps) {
  const [query, setQuery] = useState("");

  const minQueryLength =
    globalSearch?.minQueryLength ?? DEFAULT_MIN_QUERY_LENGTH;
  const [debouncedQuery] = useDebouncedValue(
    query.trim(),
    globalSearch?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
  );
  const searchEnabled =
    Boolean(globalSearch) && debouncedQuery.length >= minQueryLength;

  const {
    data: results,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-shell", "global-search", debouncedQuery],
    queryFn: ({ signal }) => globalSearch!.search(debouncedQuery, signal),
    enabled: searchEnabled,
    staleTime: globalSearch?.staleTime ?? DEFAULT_STALE_TIME_MS,
    // Keeps the previous result set on screen while the next query resolves, so
    // the list doesn't collapse to "nothing found" between keystrokes.
    placeholderData: keepPreviousData,
    retry: false,
  });

  const navActions = useMemo<SpotlightActionData[]>(
    () =>
      buildNavSpotlightTargets(mainNav, additional).map((target) => ({
        id: target.id,
        label: target.label,
        description: target.description,
        group: target.group,
        keywords: target.keywords,
        leftSection: target.icon ? (
          <target.icon size={20} weight="duotone" />
        ) : undefined,
        onClick: () => {
          if (target.onClick) {
            target.onClick();
            return;
          }
          if (target.href) onNavigate?.(target.href);
        },
      })),
    [mainNav, additional, onNavigate],
  );

  const resultGroups = useMemo<SpotlightActionGroupData[]>(
    () => (searchEnabled ? toResultGroups(results ?? [], onNavigate) : []),
    [searchEnabled, results, onNavigate],
  );

  const actions = useMemo<SpotlightActions[]>(() => {
    const navLimit = resultGroups.length
      ? (globalSearch?.navResultLimit ?? DEFAULT_NAV_RESULT_LIMIT)
      : NAV_ONLY_LIMIT;
    const navMatches = limitFlat(filterNavActions(query, navActions), navLimit);

    return [...navMatches, ...resultGroups];
  }, [query, navActions, resultGroups, globalSearch?.navResultLimit]);

  const isSearching = searchEnabled && isFetching;

  return (
    <Spotlight
      actions={actions}
      filter={passThroughFilter}
      query={query}
      onQueryChange={setQuery}
      nothingFound={
        <EmptyState
          query={query.trim()}
          minQueryLength={minQueryLength}
          searchable={Boolean(globalSearch)}
          searching={isSearching}
          errored={searchEnabled && isError}
          onRetry={() => void refetch()}
        />
      }
      highlightQuery
      scrollable
      maxHeight={400}
      styles={{
        actionLabel: { fontSize: "var(--mantine-font-size-sm)" },
        actionDescription: { fontSize: "var(--mantine-font-size-xs)" },
        empty: { fontSize: "var(--mantine-font-size-sm)" },
      }}
      searchProps={{
        size: "sm",
        leftSection: <MagnifyingGlass size={20} />,
        rightSection: isSearching ? <Loader size="xs" /> : undefined,
        placeholder:
          globalSearch?.placeholder ??
          (globalSearch
            ? "Search records and modules..."
            : "Search modules..."),
        "aria-label": globalSearch ? "Global search" : "Search modules",
      }}
    />
  );
}

/**
 * The list is pre-filtered (nav in-memory, records server-side), so the only
 * correct filter at this point is the identity.
 */
const passThroughFilter = (_query: string, actions: SpotlightActions[]) =>
  actions;

/** Group results by their `group`, preserving provider order in and across groups. */
function toResultGroups(
  results: AdminShellSearchResult[],
  onNavigate?: (href: string) => void,
): SpotlightActionGroupData[] {
  const groups = new Map<string, SpotlightActionGroupData>();

  for (const result of results) {
    let group = groups.get(result.group);
    if (!group) {
      group = { group: result.group, actions: [] };
      groups.set(result.group, group);
    }

    group.actions.push({
      // Namespaced so an app-supplied id can never collide with a nav target id.
      id: `global-search:${result.group}:${result.id}`,
      label: result.label,
      description: result.description,
      leftSection: result.icon ? (
        <result.icon size={20} weight="duotone" />
      ) : undefined,
      rightSection: result.hint ? (
        <Text size="xs" c="dimmed">
          {result.hint}
        </Text>
      ) : undefined,
      onClick: () => {
        if (result.onClick) {
          result.onClick();
          return;
        }
        if (result.href) onNavigate?.(result.href);
      },
    });
  }

  return Array.from(groups.values());
}

/**
 * Mirrors `defaultSpotlightFilter`: label matches first, then description /
 * keyword matches, regrouped by the action's `group`. Reimplemented rather than
 * imported because Mantine does not export it, and the remote half of the list
 * must bypass filtering entirely (see the component doc comment).
 */
function filterNavActions(
  rawQuery: string,
  actions: SpotlightActionData[],
): SpotlightActions[] {
  const query = rawQuery.trim().toLowerCase();
  const labelMatches: SpotlightActionData[] = [];
  const secondaryMatches: SpotlightActionData[] = [];

  for (const action of actions) {
    if (action.label?.toLowerCase().includes(query)) {
      labelMatches.push(action);
    } else if (
      action.description?.toLowerCase().includes(query) ||
      keywordText(action.keywords).includes(query)
    ) {
      secondaryMatches.push(action);
    }
  }

  return groupByGroupField([...labelMatches, ...secondaryMatches]);
}

function keywordText(keywords: SpotlightActionData["keywords"]): string {
  if (Array.isArray(keywords)) {
    return keywords.join(",").toLowerCase();
  }
  return typeof keywords === "string" ? keywords.toLowerCase() : "";
}

/** Groups actions carrying a `group`, preserving first-seen order; ungrouped stay flat. */
function groupByGroupField(actions: SpotlightActionData[]): SpotlightActions[] {
  const groups = new Map<string, SpotlightActionGroupData>();
  const result: SpotlightActions[] = [];

  for (const action of actions) {
    if (!action.group) {
      result.push(action);
      continue;
    }

    let group = groups.get(action.group);
    if (!group) {
      group = { group: action.group, actions: [] };
      groups.set(action.group, group);
      result.push(group);
    }
    group.actions.push(action);
  }

  return result;
}

/** Caps total actions across a mixed flat/grouped list, dropping emptied groups. */
function limitFlat(actions: SpotlightActions[], limit: number) {
  const limited: SpotlightActions[] = [];
  let count = 0;

  for (const item of actions) {
    if (count >= limit) break;

    if ("actions" in item) {
      const groupActions = item.actions.slice(0, limit - count);
      if (groupActions.length === 0) continue;
      limited.push({ group: item.group, actions: groupActions });
      count += groupActions.length;
      continue;
    }

    limited.push(item);
    count += 1;
  }

  return limited;
}

interface EmptyStateProps {
  query: string;
  minQueryLength: number;
  searchable: boolean;
  searching: boolean;
  errored: boolean;
  onRetry: () => void;
}

/**
 * The one place the spotlight speaks: nothing matched *yet*, nothing matched
 * *at all*, or the search itself failed. Never a bare "no results" while a
 * request is still in flight — that reads as a definitive empty answer.
 */
function EmptyState({
  query,
  minQueryLength,
  searchable,
  searching,
  errored,
  onRetry,
}: EmptyStateProps) {
  if (searching) {
    return (
      <Group gap="xs" justify="center">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          Searching...
        </Text>
      </Group>
    );
  }

  if (errored) {
    return (
      <Group gap="xs" justify="center">
        <Text size="sm" c="red.6">
          Search is unavailable right now.
        </Text>
        <Button size="compact-xs" variant="light" onClick={onRetry}>
          Try again
        </Button>
      </Group>
    );
  }

  if (searchable && query.length > 0 && query.length < minQueryLength) {
    return (
      <Text size="sm" c="dimmed">
        Keep typing — {minQueryLength} characters minimum to search records.
      </Text>
    );
  }

  return (
    <Text size="sm" c="dimmed">
      {searchable ? "No modules or records found..." : "No modules found..."}
    </Text>
  );
}
