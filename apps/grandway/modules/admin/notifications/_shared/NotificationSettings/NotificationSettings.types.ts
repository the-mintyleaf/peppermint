import type { NotificationCategory } from "../../notifications.types";

/** One labelled block of switches in the settings surface. */
export interface SettingsSection {
  title: string;
  categories: NotificationCategory[];
}
