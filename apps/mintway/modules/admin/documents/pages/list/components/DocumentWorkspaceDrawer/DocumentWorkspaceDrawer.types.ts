import type { DocumentWorkspaceSummary } from "@/modules/documents";

export interface DocumentWorkspaceDrawerProps {
  workspace: DocumentWorkspaceSummary | null;
  opened: boolean;
  onClose: () => void;
}
