import type { ReactNode } from "react";

export interface SettingsSubScreenProps {
  title: string;
  onBack: () => void;
  children: ReactNode;
}
