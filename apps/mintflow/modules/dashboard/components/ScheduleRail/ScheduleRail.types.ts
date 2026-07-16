import type { ScheduleItem } from "../../module.api";

export interface ScheduleRailProps {
  /** Timeline rows — meetings, focus blocks, deadlines, and free-time gaps. */
  items: ScheduleItem[];
}
