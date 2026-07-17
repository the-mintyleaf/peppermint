import type { ApplicantListRow } from "@/modules/admin/applicant/_shared";

export interface NewDocumentModalProps {
  opened: boolean;
  onClose: () => void;
}

/** The two screens the modal swaps between. */
export type NewDocumentView = "search" | "create";

export interface StudentCardProps {
  student: ApplicantListRow;
  selected: boolean;
  onSelect: (student: ApplicantListRow) => void;
}

export interface StudentSearchViewProps {
  search: string;
  onSearchChange: (value: string) => void;
  students: ApplicantListRow[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedId: string | null;
  onSelect: (student: ApplicantListRow) => void;
  /** Open the inline create-student screen (empty-result CTA). */
  onCreateNew: () => void;
}

export interface CreateStudentViewProps {
  /** Seed the first-name field from whatever was typed in search. */
  initialName: string;
  onBack: () => void;
  /** Fired with the fresh student's id once created. */
  onCreated: (studentId: string) => void;
}
