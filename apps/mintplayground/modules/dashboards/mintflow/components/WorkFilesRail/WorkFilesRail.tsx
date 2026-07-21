"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";
import { rankWorkFiles } from "../../Mintflow.hooks";
import { WorkFileCard } from "./components/WorkFileCard";
import type { WorkFilesRailProps } from "./WorkFilesRail.types";

/**
 * "Active work files" rail (spec §7) — the ranked top files (involvement →
 * deadline → blockers → activity; never alphabetical). Presentational:
 * loading / error / permission handled by the parent ModuleMintflow.
 */
export function WorkFilesRail({
  files,
  onOpenFile,
  onViewAll,
}: WorkFilesRailProps) {
  const ranked = rankWorkFiles(files).slice(0, 2);

  return (
    <Box style={{ padding: 18 }}>
      <Group justify="space-between" align="center" wrap="nowrap" mb={13}>
        <Text
          component="h3"
          fw={700}
          c={tokens.ink}
          style={{ fontSize: 15, letterSpacing: "-0.2px" }}
        >
          Active work files
        </Text>
        <UnstyledButton onClick={onViewAll}>
          <Text fz="12px" fw={700} c={tokens.accentDark}>
            View all
          </Text>
        </UnstyledButton>
      </Group>

      {ranked.length === 0 ? (
        <Stack align="center" gap={4} py={24}>
          <Text fz="13px" fw={500} c={tokens.muted2}>
            No active work files
          </Text>
        </Stack>
      ) : (
        <Stack gap={11}>
          {ranked.map((file) => (
            <WorkFileCard key={file.id} file={file} onOpenFile={onOpenFile} />
          ))}
        </Stack>
      )}
    </Box>
  );
}
