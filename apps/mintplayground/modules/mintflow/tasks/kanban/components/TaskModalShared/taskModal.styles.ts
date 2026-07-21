import type { CSSProperties } from "react";

export const TASK_MODAL = {
  contentPadding: 20,
  headerPaddingX: 20,
  headerPaddingY: 8,
  fieldLabelWidth: 88,
  sectionGap: 12,
  fieldGap: 8,
  majorSectionGap: 8,
} as const;

export const assigneePillStyle: CSSProperties = {
  border: "1px solid var(--mantine-color-gray-2)",
  borderRadius: "var(--mantine-radius-xl)",
  background: "white",
  padding: "4px 10px 4px 4px",
};

export const attachmentCardStyle: CSSProperties = {
  border: "1px solid var(--mantine-color-gray-2)",
  borderRadius: "var(--mantine-radius-sm)",
  background: "white",
  minWidth: 160,
  padding: "6px 10px",
};

export const addAttachmentStyle: CSSProperties = {
  border: "1px dashed var(--mantine-color-gray-3)",
  borderRadius: "var(--mantine-radius-sm)",
  background: "white",
  width: 44,
  height: 44,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

export const descriptionInputStyles = {
  input: {
    fontSize: "var(--mantine-font-size-xs)",
    backgroundColor: "white",
    border: "1px solid var(--mantine-color-gray-2)",
    borderRadius: "var(--mantine-radius-sm)",
    lineHeight: 1.6,
  },
};

export const tableStyles = {
  th: {
    fontSize: "var(--mantine-font-size-xs)",
    fontWeight: 600,
    color: "var(--mantine-color-gray-6)",
    backgroundColor: "var(--mantine-color-gray-0)",
  },
  td: { fontSize: "var(--mantine-font-size-xs)" },
};

export const headerActionStyle: CSSProperties = {
  border: "1px solid var(--mantine-color-gray-2)",
  background: "white",
};
