import type { DocumentStatus, DocumentType } from "@/modules/documents";

/**
 * The criteria bar's own value shape — one field per documented `documents/search/`
 * query param. Kept as empty strings / nulls (never `undefined`) so the controls stay
 * controlled and the serialized query key is stable between renders.
 */
export interface DocumentSearchCriteriaValues {
  /** `applicant` — code or name. */
  applicant: string;
  /** `label` — document label. */
  label: string;
  /** `document_type`. */
  type: DocumentType | null;
  /** `status`. */
  status: DocumentStatus | null;
  /** `template_version`. */
  templateVersion: string;
  /** `application_case_id`. */
  applicationCaseId: string;
  /** `created_from` / `created_to` — `YYYY-MM-DD`. */
  createdFrom: string | null;
  createdTo: string | null;
  /** `updated_from` / `updated_to` — `YYYY-MM-DD`. */
  updatedFrom: string | null;
  updatedTo: string | null;
}

export const EMPTY_SEARCH_CRITERIA: DocumentSearchCriteriaValues = {
  applicant: "",
  label: "",
  type: null,
  status: null,
  templateVersion: "",
  applicationCaseId: "",
  createdFrom: null,
  createdTo: null,
  updatedFrom: null,
  updatedTo: null,
};

export interface DocumentSearchCriteriaProps {
  value: DocumentSearchCriteriaValues;
  onChange: (value: DocumentSearchCriteriaValues) => void;
  onClear: () => void;
  /** True when at least one criterion is set — drives the "Clear all" affordance. */
  hasCriteria: boolean;
}

export interface DocumentSearchPanelProps {
  /** Returns to the workspaces table. */
  onBack: () => void;
}

/** Applicant identity resolved from the cached workspaces list, keyed by applicant id. */
export type ApplicantIndex = Map<string, { name: string; code: string }>;

export interface DocumentSearchColumnsOptions {
  applicantIndex: ApplicantIndex;
  onOpenEditor: (applicantId: string) => void;
}
