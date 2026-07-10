export type SettingsTab = "profile" | "security" | "sessions" | "permissions";

export interface AccountSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}
