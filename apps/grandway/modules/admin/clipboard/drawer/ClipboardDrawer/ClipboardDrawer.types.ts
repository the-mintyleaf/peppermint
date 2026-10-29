import type { ClipboardEntry } from "../../clipboard.types";

export interface ClipboardDrawerProps {
  opened: boolean;
  onClose: () => void;
  /**
   * Raise when the drawer opens over a Modal (Mantine's 200 — the drawer's default
   * too): pass `CLIPBOARD_DRAWER_OVER_MODAL_Z_INDEX`. Its own confirms and select
   * lists already sit higher.
   */
  zIndex?: number;
}

/**
 * Which screen the drawer body is showing. The snippet list stays mounted underneath.
 * `edit` carries the list row itself — the API has no single-entry GET.
 */
export type ClipboardDrawerView =
  | { kind: "list" }
  | { kind: "new" }
  | { kind: "edit"; entry: ClipboardEntry }
  | { kind: "categories" };
