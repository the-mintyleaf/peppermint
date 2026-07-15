import type { SessionDevice } from "@/modules/admin/authenticate/_shared/authenticate.types";

/** Shared props every settings tab receives — used to render its overview header. */
export interface SettingsTabProps {
  title: string;
  description: string;
}

export type { SessionDevice };

export interface LogoutAllResponse {
  sessions_revoked: number;
}
