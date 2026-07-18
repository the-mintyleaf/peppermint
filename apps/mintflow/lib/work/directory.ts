/**
 * Actor & unit name resolution for the work domain.
 *
 * Work responses carry opaque UUIDs for people (`current_owner`, assignees,
 * reviewers, …) and units (`responsible_unit`). The UI resolves those to display
 * names via the `authenticate` and `organization` read endpoints (user decision,
 * see docs/api-contracts/work.reshape.md §2).
 *
 * Contract note: `auth` / `organization` have no synced digest in this repo yet,
 * so the read DTOs below are the **minimal** documented shapes — the user fields
 * mirror mintflow's own `CurrentUser` (`modules/auth/_shared/auth.types.ts`), the
 * unit fields mirror the known `OrganizationUnit`. We read only name/code fields.
 * Lookups fail soft: a 403/404 yields a compact id/initials placeholder rather
 * than blocking the work view. Re-sync with `/sync-api mintflow auth` +
 * `/sync-api mintflow organization` when those digests land, then tighten these.
 */

import { useQueries } from "@peppermint/ui";

import api from "@/lib/api";

/** Minimal person shape needed to render an actor (subset of the auth user). */
export interface DirectoryUser {
  id: string;
  username: string;
  display_name: string;
}

/** Minimal unit shape needed to render a responsible unit (subset of OrganizationUnit). */
export interface DirectoryUnit {
  id: string;
  name_en: string;
  name_np: string;
  code: string;
}

async function fetchUser(id: string): Promise<DirectoryUser> {
  const { data } = await api.get<DirectoryUser>(`/api/v1/auth/users/${id}/`);
  return data;
}

async function fetchUnit(id: string): Promise<DirectoryUnit> {
  const { data } = await api.get<DirectoryUnit>(
    `/api/v1/organization/units/${id}/`,
  );
  return data;
}

const DIRECTORY_STALE_MS = 5 * 60_000; // names change rarely; cache aggressively

/** Unique, defined ids from a list that may contain nulls/dupes. */
function uniqueIds(ids: readonly (string | null | undefined)[]): string[] {
  return Array.from(new Set(ids.filter((id): id is string => Boolean(id))));
}

/** A resolved directory: `get(id)` returns the record or `undefined` while loading/failed. */
export interface Directory<T> {
  get: (id: string | null | undefined) => T | undefined;
  isLoading: boolean;
}

/**
 * Resolve a set of actor ids to users. Each id is its own cached query (React
 * Query dedupes across the app), so the same person referenced by many rows is
 * fetched once. Failures resolve to `undefined` — callers fall back to initials.
 */
export function useActorDirectory(
  ids: readonly (string | null | undefined)[],
): Directory<DirectoryUser> {
  const unique = uniqueIds(ids);
  const results = useQueries({
    queries: unique.map((id) => ({
      queryKey: ["directory", "user", id] as const,
      queryFn: () => fetchUser(id),
      staleTime: DIRECTORY_STALE_MS,
      retry: false,
    })),
  });

  const byId = new Map<string, DirectoryUser>();
  results.forEach((r, i) => {
    if (r.data) byId.set(unique[i], r.data);
  });

  return {
    get: (id) => (id ? byId.get(id) : undefined),
    isLoading: results.some((r) => r.isLoading),
  };
}

/** Resolve a set of unit ids to units. Same caching/fallback semantics as actors. */
export function useUnitDirectory(
  ids: readonly (string | null | undefined)[],
): Directory<DirectoryUnit> {
  const unique = uniqueIds(ids);
  const results = useQueries({
    queries: unique.map((id) => ({
      queryKey: ["directory", "unit", id] as const,
      queryFn: () => fetchUnit(id),
      staleTime: DIRECTORY_STALE_MS,
      retry: false,
    })),
  });

  const byId = new Map<string, DirectoryUnit>();
  results.forEach((r, i) => {
    if (r.data) byId.set(unique[i], r.data);
  });

  return {
    get: (id) => (id ? byId.get(id) : undefined),
    isLoading: results.some((r) => r.isLoading),
  };
}

/** Display label for an actor id given a directory — name, else a short id. */
export function actorLabel(
  id: string | null | undefined,
  dir: Directory<DirectoryUser>,
): string {
  if (!id) return "Unassigned";
  return dir.get(id)?.display_name ?? shortId(id);
}

/** Unit label given a directory — English name, else code, else short id. */
export function unitLabel(
  id: string | null | undefined,
  dir: Directory<DirectoryUnit>,
): string {
  if (!id) return "—";
  const unit = dir.get(id);
  return unit?.name_en || unit?.code || shortId(id);
}

/** Up-to-2-char initials from a display name (falls back to id). */
export function actorInitials(
  id: string | null | undefined,
  dir: Directory<DirectoryUser>,
): string {
  const name = id ? dir.get(id)?.display_name : undefined;
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase() || "?";
  }
  return (id ?? "?").slice(0, 2).toUpperCase();
}

/** Stable Mantine avatar color derived from an id, so a person keeps one color. */
const AVATAR_COLORS = [
  "orange",
  "green",
  "teal",
  "grape",
  "blue",
  "pink",
  "cyan",
  "indigo",
] as const;

export function avatarColorForId(id: string | null | undefined): string {
  if (!id) return "gray";
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/** Short, human-scannable form of a UUID for placeholder display. */
function shortId(id: string): string {
  return id.slice(0, 8);
}
