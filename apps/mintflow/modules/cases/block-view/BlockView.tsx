"use client";

import { SimpleGrid, Stack } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { CaseCard } from "./components/CaseCard";
import { FileCard } from "./components/FileCard";
import type { BlockViewProps } from "./BlockView.types";

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
          <SectionLabel>Cases · {cases.length}</SectionLabel>
          {/* 4-up on wide screens, degrading to 1 on mobile */}
          <SimpleGrid
            cols={{ base: 1, xs: 2, md: 3, lg: 4 }}
            spacing="md"
            verticalSpacing="md"
          >
            {cases.map((c) => (
              <CaseCard key={c.id} workCase={c} onOpen={onOpenCase} />
            ))}
          </SimpleGrid>
        </Stack>
      )}

      {files.length > 0 && (
        <Stack gap="sm">
          <SectionLabel>Recent documents · {files.length}</SectionLabel>
          <SimpleGrid
            cols={{ base: 1, xs: 2, md: 3, lg: 4 }}
            spacing="md"
            verticalSpacing="md"
          >
            {files.map((f) => (
              <FileCard key={f.id} file={f} onOpen={onOpenFile} />
            ))}
          </SimpleGrid>
        </Stack>
      )}
    </Stack>
  );
}
