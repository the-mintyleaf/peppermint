"use client";

import { SimpleGrid, Stack } from "@peppermint/ui";

import { useActorDirectory, useUnitDirectory } from "@/lib/work";
import { SectionLabel } from "@/components";
import { CaseCard } from "./components/CaseCard";
import type { BlockViewProps } from "./BlockView.types";

export function BlockView({ cases, onOpenCase }: BlockViewProps) {
  // Resolve every owner/unit id once for the whole grid (cached + deduped).
  const actorDir = useActorDirectory(cases.map((c) => c.current_owner));
  const unitDir = useUnitDirectory(cases.map((c) => c.responsible_unit));

  return (
    <Stack gap="xl" p="md">
      <Stack gap="sm">
        <SectionLabel>Cases · {cases.length}</SectionLabel>
        {/* 4-up on wide screens, degrading to 1 on mobile */}
        <SimpleGrid
          cols={{ base: 1, xs: 2, md: 3, lg: 4 }}
          spacing="md"
          verticalSpacing="md"
        >
          {cases.map((c) => (
            <CaseCard
              key={c.id}
              workCase={c}
              onOpen={onOpenCase}
              actorDir={actorDir}
              unitDir={unitDir}
            />
          ))}
        </SimpleGrid>
      </Stack>
    </Stack>
  );
}
