import type { ElementType, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import type { UserInfoPopoverProps } from "./components/Navbar/UserInfoPopover/UserInfoPopover.types";

export interface AdminShellNavItem {
  label: string;
  href: string;
  icon?: Icon;
  badge?: string;
}

export interface AdminShellNavGroup {
  label: string;
  headerWidget?: ReactNode;
  items: AdminShellNavItem[];
}

export interface AdminShellSubNav {
  groups: AdminShellNavGroup[];
  widget?: ReactNode;
  homeHref: string;
}

export interface AdminShellMainNavPage {
  kind: "page";
  id: string;
  icon: Icon;
  label: string;
  href: string;
}

export interface AdminShellMainNavModule {
  kind: "module";
  id: string;
  icon: Icon;
  label: string;
  subNav: AdminShellSubNav;
}

export type AdminShellMainNavItem =
  | AdminShellMainNavPage
  | AdminShellMainNavModule;

export interface AdminShellMainNavAdditional {
  id: string;
  icon: Icon;
  label: string;
  href?: string;
  onClick?: () => void;
  badge?: string;
}

export interface AdminShellBrand {
  icon: Icon;
  href?: string;
}

export interface AdminShellAiButton {
  href?: string;
  icon?: Icon;
  label?: string;
  color?: string;
  onClick?: () => void;
  hidden?: boolean;
}

export interface AdminShellSettingsButton {
  href?: string;
  icon?: Icon;
  label?: string;
  onClick?: () => void;
  hidden?: boolean;
}

/**
 * One record returned by the app's global-search provider. Deliberately shaped
 * like a spotlight action rather than like any one domain's row — the shell
 * knows nothing about applicants, leads, or clients; the app maps its own rows
 * onto this.
 */
export interface AdminShellSearchResult {
  /** Unique within a result set. The shell namespaces it before rendering. */
  id: string;
  label: string;
  /** Secondary line — typically the record's status/owner/identifier. */
  description?: string;
  /** Result group heading, e.g. "Applicants". Results keep provider order within a group. */
  group: string;
  /** Navigated via the config's `onNavigate` when the result is triggered. */
  href?: string;
  /** Takes precedence over `href` (a result that opens a drawer rather than a route). */
  onClick?: () => void;
  icon?: Icon;
  /** Right-aligned hint, e.g. a status or a match reason. */
  hint?: string;
}

/**
 * Remote search behind the sidebar spotlight. The shell owns the input,
 * debounce, request lifecycle, and the loading/empty/error states; the app owns
 * *what* is searched — it supplies one function that fans out to whichever
 * backends the current role may read.
 */
export interface AdminShellGlobalSearch {
  /**
   * Called with the debounced, trimmed query once it reaches `minQueryLength`.
   * The shell passes an `AbortSignal` — a superseded keystroke aborts the
   * in-flight request, so a provider that ignores it only wastes a round trip.
   */
  search: (
    query: string,
    signal?: AbortSignal,
  ) => Promise<AdminShellSearchResult[]>;
  /**
   * Identifies *who* is searching — typically the role or user id. It is part
   * of the result cache key, so a role change can never serve the previous
   * role's records back for the same query. Omit only when every viewer of this
   * shell sees identical results.
   */
  scopeKey?: string;
  /** Below this length nothing is requested and only nav matches show. @default 2 */
  minQueryLength?: number;
  /** @default 250 */
  debounceMs?: number;
  /** How long a result set stays fresh in the query cache, ms. @default 30000 */
  staleTime?: number;
  /** Search input placeholder — overrides the nav-only default. */
  placeholder?: string;
  /** Nav matches shown alongside results, so records aren't pushed off-screen. @default 4 */
  navResultLimit?: number;
}

export interface AdminShellConfig {
  brand: AdminShellBrand;
  mainNav: AdminShellMainNavItem[];
  additional?: AdminShellMainNavAdditional[];
  aiButton?: AdminShellAiButton;
  settingsButton?: AdminShellSettingsButton;
  userMenu?: UserInfoPopoverProps;
  /**
   * Turns the sidebar spotlight from a nav jumper into a global search. Omit it
   * and the spotlight keeps searching navigation targets only.
   */
  globalSearch?: AdminShellGlobalSearch;
  linkComponent?: ElementType;
  /**
   * Programmatic navigation used by spotlight results and bookmark items (which
   * fire via onClick, not an anchor). Without it, spotlight/bookmark navigation
   * is inert. Apps typically pass `(href) => router.push(href)`.
   */
  onNavigate?: (href: string) => void;
}
