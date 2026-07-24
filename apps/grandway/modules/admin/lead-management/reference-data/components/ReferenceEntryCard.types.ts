import type { ReferenceEntry } from "../../leadManagement.types";

export interface ReferenceEntryCardProps {
  entry: ReferenceEntry;
  onEdit: () => void;
  onSetActive: (isActive: boolean) => void;
  /** This row's own toggle is in flight — drives the spinner. */
  isSettingActive: boolean;
  /** Some row's toggle is in flight — disables this row's action even when it isn't the one loading. */
  activeToggleDisabled: boolean;
}
