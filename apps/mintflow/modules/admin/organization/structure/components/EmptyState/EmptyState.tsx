"use client";

import { Button, Stack, Text, ThemeIcon, Title } from "@peppermint/ui";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";

import styles from "../../Structure.module.css";
import type { EmptyStateProps } from "./EmptyState.types";

export function EmptyState({ onCreateRoot }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <Stack align="center" gap="sm">
          <ThemeIcon size={48} radius="xl" variant="light">
            <TreeStructureIcon size={24} weight="fill" aria-hidden />
          </ThemeIcon>
          <Title order={4}>No units yet</Title>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            Create the root unit first, then build out the structure underneath
            it.
          </Text>
          <Button onClick={onCreateRoot}>Create Root Unit</Button>
        </Stack>
      </div>
    </div>
  );
}
