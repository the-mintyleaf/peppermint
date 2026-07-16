"use client";

import { Box, Stack } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import { CaseRow } from "./components/CaseRow";
import { FileRow } from "./components/FileRow";
import type { ListViewProps } from "./ListView.types";
import classes from "./ListView.module.css";

const CASE_HEADERS = [
  "Case",
  "Status",
  "Priority",
  "Progress",
  "Departments",
  "Officers",
  "Due",
  "",
];
const FILE_HEADERS = ["Document", "Type", "Case", "Size", "Modified", ""];

const cardStyle = {
  background: tokens.paper,
  border: `1px solid ${tokens.line}`,
  borderRadius: tokens.radius.card,
  overflow: "hidden",
} as const;

export function ListView({
  cases,
  files,
  onOpenCase,
  onOpenFile,
}: ListViewProps) {
  return (
    <Stack gap="xl" p="md">
      {cases.length > 0 && (
        <Stack gap="sm">
          <SectionLabel>Cases · {cases.length}</SectionLabel>
          <Box style={cardStyle}>
            <div className={classes.scroll}>
              <div className={classes.table}>
                <div className={`${classes.caseGrid} ${classes.header}`}>
                  {CASE_HEADERS.map((label, i) => (
                    <span key={i} className={classes.headerLabel}>
                      {label}
                    </span>
                  ))}
                </div>
                {cases.map((c) => (
                  <CaseRow key={c.id} workCase={c} onOpen={onOpenCase} />
                ))}
              </div>
            </div>
          </Box>
        </Stack>
      )}

      {files.length > 0 && (
        <Stack gap="sm">
          <SectionLabel>Recent documents · {files.length}</SectionLabel>
          <Box style={cardStyle}>
            <div className={classes.scroll}>
              <div className={classes.table}>
                <div className={`${classes.fileGrid} ${classes.header}`}>
                  {FILE_HEADERS.map((label, i) => (
                    <span key={i} className={classes.headerLabel}>
                      {label}
                    </span>
                  ))}
                </div>
                {files.map((f) => (
                  <FileRow key={f.id} file={f} onOpen={onOpenFile} />
                ))}
              </div>
            </div>
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
