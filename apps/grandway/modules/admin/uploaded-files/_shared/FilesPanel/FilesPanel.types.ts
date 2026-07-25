import type { FileOwnerScope } from "../../uploadedFiles.types";

export interface FilesPanelProps {
  /** Exactly one key set — the owner this panel is embedded against. */
  scope: FileOwnerScope;
}
