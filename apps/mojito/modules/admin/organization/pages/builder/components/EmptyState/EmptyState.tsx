"use client";

import { Stack, Text, Button, Group, ThemeIcon } from "@peppermint/ui";
import { BuildingsIcon } from "@phosphor-icons/react/dist/csr/Buildings";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { useOrgBuilderStore } from "../../../../organization.store";
import styles from "../../OrganizationBuilder.module.css";

export function EmptyState() {
  const { openAddModal } = useOrgBuilderStore();

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateContent}>
        <ThemeIcon
          size={64}
          radius="xl"
          variant="light"
          color="blue"
          mx="auto"
          mb="lg"
          style={{ display: "flex" }}
        >
          <TreeStructureIcon size={32} weight="duotone" aria-label="Organization structure" />
        </ThemeIcon>

        <Text size="xl" fw={700} mb="xs">
          Build your organization structure
        </Text>
        <Text size="sm" c="dimmed" mb="xl" style={{ lineHeight: 1.6 }}>
          Start by adding your first organization, department, or person. You can connect them
          later to define hierarchy, ownership, reporting lines, and responsibilities.
        </Text>

        <Group gap="sm" justify="center" wrap="wrap">
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftSection={<BuildingsIcon size={16} aria-label="Organization" />}
            onClick={() => openAddModal("org")}
          >
            Add Organization
          </Button>
          <Button
            variant="light"
            color="violet"
            size="sm"
            leftSection={<FolderIcon size={16} aria-label="Department" />}
            onClick={() => openAddModal("department")}
          >
            Add Department
          </Button>
          <Button
            variant="light"
            color="teal"
            size="sm"
            leftSection={<UserIcon size={16} aria-label="Person" />}
            onClick={() => openAddModal("person")}
          >
            Add Person
          </Button>
        </Group>
      </div>
    </div>
  );
}
