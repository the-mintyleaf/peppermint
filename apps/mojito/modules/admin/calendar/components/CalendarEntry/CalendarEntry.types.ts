import type { CalendarEntry } from "../../Calendar.types";

export interface CalendarEntryProps {
  entry: CalendarEntry;
  onClick: (entry: CalendarEntry) => void;
}
