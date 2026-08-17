import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { PaperclipIcon } from "@phosphor-icons/react/dist/csr/Paperclip";
import { SignatureIcon } from "@phosphor-icons/react/dist/csr/Signature";
import { StampIcon } from "@phosphor-icons/react/dist/csr/Stamp";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import type { Icon } from "@phosphor-icons/react";
import type {
  GlobalSearchAccess,
  SearchEntityType,
} from "./globalSearch.types";

/**
 * `entity_type` → this app's own routing.
 *
 * **A hit's `detail_path` is an API path and is never navigated to.** The
 * contract says so twice, and the shapes genuinely differ: the API's
 * `/api/v1/catalogue/institutions/<id>/` has no frontend equivalent, and four of
 * the nine types have no detail route in this app at all.
 *
 * Two landing strategies, one per type:
 *
 * - **`detail`** — the record has its own route, so the hit's id builds it.
 * - **`list`** — it does not, so the hit lands on the owning list with `?q=`,
 *   which that list reads through `lib/useDeepLinkSearch.ts` and seeds into its
 *   own search box. The record is then one row away rather than one retyped
 *   query away. Seed, not lock — the reader can clear it immediately.
 */
type RouteStrategy =
  | { kind: "detail"; path: (id: string) => string }
  | { kind: "list"; path: string; seed: boolean };

export interface EntityRoute {
  /** Group heading in the spotlight. Falls back to the bucket's server `label`. */
  icon: Icon;
  route: RouteStrategy;
  /** Which capability must hold for this bucket to be requested at all. */
  permitted: (access: GlobalSearchAccess) => boolean;
}

export const ENTITY_ROUTES: Record<SearchEntityType, EntityRoute> = {
  applicant: {
    icon: UsersThreeIcon,
    route: { kind: "detail", path: (id) => `/admin/applicants/${id}` },
    permitted: (access) => access.applicants,
  },
  lead: {
    icon: AddressBookIcon,
    // Leads open in an in-page drawer on the board, not on a route of their own.
    route: { kind: "list", path: "/admin/lead-management", seed: true },
    permitted: (access) => access.leads,
  },
  client: {
    icon: HandshakeIcon,
    // The directory opens a client in a drawer from its list.
    route: { kind: "list", path: "/admin/clients", seed: true },
    permitted: (access) => access.clients,
  },
  document: {
    icon: FileTextIcon,
    /**
     * The one type that lost a direct link in the migration, and it is worth
     * knowing why. The editor route depends on whether the document is
     * standalone (`/documents/standalone/<id>`) or belongs to an applicant
     * (`/documents/workspace/<applicantId>`) — and a `SearchHit` carries
     * neither the flag nor the applicant id. The client-side fan-out this
     * replaced read both from the documents list row; the search contract
     * exposes only `id`, `title`, `subtitle`, `matched_on`.
     *
     * Landing on the worklist with the label seeded is the honest answer:
     * the row is one click from there, and it is correct for both shapes.
     * If the backend ever adds the applicant id to the document hit, this
     * becomes a `detail` strategy again.
     */
    route: { kind: "list", path: "/admin/documents/all", seed: true },
    permitted: (access) => access.documents,
  },
  uploaded_file: {
    icon: PaperclipIcon,
    // New reach — the old client-side fan-out never searched files at all.
    route: { kind: "detail", path: (id) => `/admin/files/${id}` },
    permitted: (access) => access.files,
  },
  institution: {
    icon: BuildingsIcon,
    route: { kind: "list", path: "/admin/institutions/providers", seed: true },
    permitted: (access) => access.catalogue,
  },
  program: {
    icon: GraduationCapIcon,
    route: { kind: "list", path: "/admin/institutions", seed: true },
    permitted: (access) => access.catalogue,
  },
  document_template: {
    icon: StampIcon,
    // Document templates are authored in the backend and only ever *used* here,
    // so a hit lands on the surface that consumes them. No seed: that roll-up
    // does not read `?q=`.
    route: { kind: "list", path: "/admin/documents", seed: false },
    permitted: (access) => access.documentLibrary,
  },
  signatory: {
    icon: SignatureIcon,
    // Same reasoning as `document_template` — the app has no signatory screen.
    route: { kind: "list", path: "/admin/documents", seed: false },
    permitted: (access) => access.documentLibrary,
  },
};

/** The frontend URL a hit opens. */
export function hitHref(
  entityType: SearchEntityType,
  id: string,
  title: string,
): string {
  const { route } = ENTITY_ROUTES[entityType];
  if (route.kind === "detail") return route.path(id);
  return route.seed && title
    ? `${route.path}?q=${encodeURIComponent(title)}`
    : route.path;
}

/**
 * Where a bucket's "see all N" goes.
 *
 * Not the bucket's `list_url`, which is the owning module's **API** URL. The
 * frontend list is seeded with the query itself rather than the row title.
 */
export function bucketHref(
  entityType: SearchEntityType,
  query: string,
): string {
  const { route } = ENTITY_ROUTES[entityType];
  if (route.kind === "detail") {
    // The two detail types both live under a list route one segment up.
    return entityType === "applicant" ? "/admin/applicants" : "/admin/files";
  }
  return route.seed
    ? `${route.path}?q=${encodeURIComponent(query)}`
    : route.path;
}

/**
 * The `types=` allowlist for this role.
 *
 * Sent on the request rather than filtered out of the response, for two
 * reasons: a bucket the reader may not open is never fetched, and `types` is the
 * only control a client has over the cost of a search — a full nine-type query
 * is 20 database queries.
 */
export function permittedTypes(access: GlobalSearchAccess): SearchEntityType[] {
  return (Object.keys(ENTITY_ROUTES) as SearchEntityType[]).filter((key) =>
    ENTITY_ROUTES[key].permitted(access),
  );
}
