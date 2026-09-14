import type {
  ChecklistOrigin,
  ChecklistStatus,
  ItemStatus,
  ItemType,
  TemplateStatus,
} from "./checklists.types";

export const TEMPLATE_STATUS_LABELS: Record<TemplateStatus, string> = {
  draft: "Draft",
  active: "Active",
  inactive: "Inactive",
};

export const TEMPLATE_STATUS_COLORS: Record<TemplateStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "red",
};

export const CHECKLIST_STATUS_LABELS: Record<ChecklistStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  archived: "Archived",
};

export const CHECKLIST_STATUS_COLORS: Record<ChecklistStatus, string> = {
  draft: "gray",
  active: "blue",
  completed: "green",
  archived: "dark",
};

export const CHECKLIST_ORIGIN_LABELS: Record<ChecklistOrigin, string> = {
  auto: "Automatic",
  manual: "Manual",
};

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  waived: "Waived",
  blocked: "Blocked",
  not_applicable: "Not applicable",
};

/** `blocked` gets its own alarming colour — it still counts as outstanding, never a resolution. */
export const ITEM_STATUS_COLORS: Record<ItemStatus, string> = {
  pending: "orange",
  completed: "green",
  waived: "blue",
  blocked: "red",
  not_applicable: "gray",
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  document: "Document",
  stage: "Stage",
  task: "Task",
};

/**
 * Tag-sized type labels for a list row, where the type is a glance not a
 * sentence — the full words live in the forms and the `Select`s.
 */
export const ITEM_TYPE_SHORT_LABELS: Record<ItemType, string> = {
  document: "DOC",
  stage: "STAGE",
  task: "TASK",
};

/** A document is the type that needs a file from someone, so it is the one that gets a colour. */
export const ITEM_TYPE_COLORS: Record<ItemType, string> = {
  document: "blue",
  stage: "gray",
  task: "gray",
};

// ── Select option helpers ────────────────────────────────────────────────────

export const TEMPLATE_STATUS_OPTIONS = (
  Object.keys(TEMPLATE_STATUS_LABELS) as TemplateStatus[]
).map((value) => ({ value, label: TEMPLATE_STATUS_LABELS[value] }));

export const CHECKLIST_STATUS_OPTIONS = (
  Object.keys(CHECKLIST_STATUS_LABELS) as ChecklistStatus[]
).map((value) => ({ value, label: CHECKLIST_STATUS_LABELS[value] }));

export const ITEM_STATUS_OPTIONS = (
  Object.keys(ITEM_STATUS_LABELS) as ItemStatus[]
).map((value) => ({ value, label: ITEM_STATUS_LABELS[value] }));

export const ITEM_TYPE_OPTIONS = (
  Object.keys(ITEM_TYPE_LABELS) as ItemType[]
).map((value) => ({ value, label: ITEM_TYPE_LABELS[value] }));
