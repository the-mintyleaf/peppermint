import type { Institution } from "../../../../../institutions.types";

export interface CampusManagerProps {
  /** The institution whose campuses are being managed; null keeps the drawer closed. */
  institution: Institution | null;
  opened: boolean;
  onClose: () => void;
  /** Admin-only — gates the add / edit / withdraw controls. */
  canManage: boolean;
}
