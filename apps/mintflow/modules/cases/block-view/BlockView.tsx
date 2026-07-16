"use client";

import { Box, Stack } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { CaseCard } from "./components/CaseCard";
import { FileCard } from "./components/FileCard";
import type { BlockViewProps } from "./BlockView.types";

const CASE_GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(212px, 1fr))",
  gap: 12,
} as const;

const FILE_GRID = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 12,
} as const;

export function BlockView({
  cases,
  files,
  onOpenCase,
  onOpenFile,
}: BlockViewProps) {
  return (
    <Stack gap="xl" p="md">
      {cases.length > 0 && (
        <Stack gap="sm">
          <SectionLabel>Cases</SectionLabel>
          <Box style={CASE_GRID}>
            {cases.map((c) => (
              <CaseCard key={c.id} workCase={c} onOpen={onOpenCase} />
            ))}
          </Box>
        </Stack>
      )}

      {files.length > 0 && (
        <Stack gap="sm">
          <SectionLabel>Files</SectionLabel>
          <Box style={FILE_GRID}>
            {files.map((f) => (
              <FileCard key={f.id} file={f} onOpen={onOpenFile} />
            ))}
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
