"use client";

import { Badge, Center, Paper, SimpleGrid, Stack, Text, Title } from "@peppermint/ui";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { HourglassIcon } from "@phosphor-icons/react/dist/csr/Hourglass";

const PLANNED_FEATURES = [
  "Office hierarchy tree view",
  "Create & manage ministry, department, division units",
  "District and area administration offices",
  "Parent-child hierarchy with drag-and-drop reorder",
  "Office head assignment",
  "Task visibility & confidentiality settings",
  "Escalation rules per unit",
  "Audit log for all changes",
];

export function OrgHome() {
  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)">
      <Center h="100%">
        <Stack align="center" gap="xl" maw={540} px="xl">
          <Stack align="center" gap="sm">
            <TreeStructureIcon size={48} aria-label="Organization hierarchy" />
            <Title order={2} ta="center">Organization Module</Title>
            <Text size="sm" c="dimmed" ta="center">
              The Office Hierarchy module for the Nepal Home Ministry Kanban system.
              This will be the backbone for authentication, role-based permissions,
              task ownership, and escalation across the platform.
            </Text>
          </Stack>

          <Badge
            size="lg"
            variant="light"
            color="yellow"
            leftSection={<HourglassIcon size={14} aria-label="In progress" />}
          >
            Coming Soon
          </Badge>

          <SimpleGrid cols={1} spacing="xs" w="100%">
            {PLANNED_FEATURES.map((feature) => (
              <Text key={feature} size="sm" c="dimmed">
                — {feature}
              </Text>
            ))}
          </SimpleGrid>
        </Stack>
      </Center>
    </Paper>
  );
}
