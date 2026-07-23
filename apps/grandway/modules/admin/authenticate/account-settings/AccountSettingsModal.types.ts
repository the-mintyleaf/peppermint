export type SettingsTab = "profile" | "security" | "sessions";

export interface AccountSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}
