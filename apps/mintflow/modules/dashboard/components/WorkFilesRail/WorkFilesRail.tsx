"use client";

import { Button, Group, Stack, Text } from "@peppermint/ui";

import { SectionLabel } from "@/components";
import { tokens } from "@/config/design";
import { rankWorkFiles } from "../../Dashboard.hooks";
import { WorkFileCard } from "./components/WorkFileCard";
import type { WorkFilesRailProps } from "./WorkFilesRail.types";

/**
 * "Active work files" rail (spec §7) — the ranked top three work files
 * (involvement → deadline → blockers → activity; never alphabetical).
 * Presentational: loading / error / permission handled by the parent
 * ModuleDashboard.
 */
export function WorkFilesRail({
  files,
  onOpenFile,
  onViewAll,
}: WorkFilesRailProps) {
  const ranked = rankWorkFiles(files).slice(0, 3);

  return (
    <Stack gap={12}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <SectionLabel>Active work files</SectionLabel>
        <Button
          variant="subtle"
          color="gray"
          size="compact-xs"
          onClick={onViewAll}
        >
          View all
        </Button>
      </Group>

      {ranked.length === 0 ? (
        <Stack align="center" gap={4} py={28}>
          <Text fz={13} fw={500} c={tokens.muted2}>
            No active work files
          </Text>
        </Stack>
      ) : (
        <Stack gap={12}>
          {ranked.map((file) => (
            <WorkFileCard key={file.id} file={file} onOpenFile={onOpenFile} />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
