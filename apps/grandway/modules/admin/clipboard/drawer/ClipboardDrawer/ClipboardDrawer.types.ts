import type { ClipboardEntry } from "../../clipboard.types";

export interface ClipboardDrawerProps {
  opened: boolean;
  onClose: () => void;
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
