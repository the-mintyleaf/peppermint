import type { Person } from "../../people.types";

export interface PeopleProfileDrawerProps {
  person: Person | null;
  opened: boolean;
  onClose: () => void;
  onStatusChange: (
    person: Person,
    newStatus: Person["membership_status"],
  ) => void;
}
