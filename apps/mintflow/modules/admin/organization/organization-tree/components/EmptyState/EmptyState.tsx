"use client";

import { Text, Button, Group, ThemeIcon } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { useOrgTreeStore } from "../../OrganizationTree.store";
import styles from "../../OrganizationTree.module.css";

export function EmptyState() {
  const { openAddModal } = useOrgTreeStore();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <ThemeIcon size={64} radius="xl" variant="light" color="blue" mx="auto" mb="lg" style={{ display: "flex" }}>
          <TreeStructureIcon size={32} weight="duotone" aria-label="Organization structure" />
        </ThemeIcon>

        <Text size="xl" fw={700} mb="xs">Build your organization structure</Text>
        <Text size="sm" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
          Start by adding an organization or department. Click any node to reveal its people.
        </Text>

        <Group gap="sm" justify="center" wrap="wrap">
          <Button variant="light" color="blue" size="sm" leftSection={<BuildingsIcon size={16} aria-label="Organization" />} onClick={() => openAddModal("org")}>
            Add Organization
          </Button>
          <Button variant="light" color="violet" size="sm" leftSection={<FolderIcon size={16} aria-label="Department" />} onClick={() => openAddModal("department")}>
            Add Department
          </Button>
        </Group>
      </div>
    </div>
  );
}
