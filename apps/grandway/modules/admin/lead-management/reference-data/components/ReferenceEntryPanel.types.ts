import type { ReferenceEntry } from "../../leadManagement.types";
import type { ReferenceEntryFormValues } from "./ReferenceEntryForm.types";

export interface ReferenceEntryPanelProps {
  /** e.g. "lead source" / "loss reason" — used in empty-state and error copy. */
  entityLabel: string;
  entries: ReferenceEntry[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onCreate: (
    values: ReferenceEntryFormValues,
  ) => Promise<{ ok: boolean; message?: string }>;
  isCreating: boolean;
  onUpdate: (
    id: string,
    values: ReferenceEntryFormValues,
  ) => Promise<{ ok: boolean; message?: string }>;
  isUpdating: boolean;
  onSetActive: (id: string, isActive: boolean) => void;
  /** The id currently mid-retire/reactivate, if any — drives that one card's loading state. */
  settingActiveId: string | null;
  /**
   * True whenever *any* row's retire/reactivate call is in flight — the
   * underlying mutation is one shared instance per resource, so its
   * `variables` only ever identifies the *latest* call; every row's toggle
   * is disabled while one is pending to prevent a second click from
   * overwriting `settingActiveId` mid-request and leaving the first row
   * looking idle while its request is still outstanding.
   */
  isTogglingActive: boolean;
  /** Reports whether an add/edit draft is open, so the parent modal can guard its own close. */
  onDraftStateChange?: (hasDraft: boolean) => void;
}
