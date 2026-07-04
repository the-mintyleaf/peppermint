"use client";

import {
  Badge,
  Button,
  Divider,
  Drawer,
  Group,
  List,
  Loader,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { ArrowsOutCardinalIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutCardinal";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";

import {
  useUnitAncestors,
  useUnitDescendants,
  useUnitDetail,
} from "../../Structure.hooks";
import { useStructureStore } from "../../Structure.store";
import styles from "../../Structure.module.css";

export function InspectorPanel() {
  const {
    selectedUnitId,
    drawerOpen,
    closeDrawer,
    openAddUnitModal,
    openEditUnitModal,
    openMoveModal,
    openDeactivateModal,
  } = useStructureStore();

  const { data: unit, isLoading } = useUnitDetail(selectedUnitId);
  const { data: ancestors } = useUnitAncestors(selectedUnitId);
  const { data: descendants } = useUnitDescendants(selectedUnitId);

  return (
    <Drawer
      opened={drawerOpen}
      onClose={closeDrawer}
      position="right"
      title="Unit Details"
      size="sm"
    >
      {isLoading || !unit ? (
        <Group justify="center" py="xl">
          <Loader size="sm" />
        </Group>
      ) : (
        <Stack gap="md">
          <div>
            <Group gap="xs" align="center" mb={4}>
              <Title order={4}>{unit.name}</Title>
              <Badge size="xs">{unit.status}</Badge>
            </Group>
            <Text size="xs" c="dimmed">
              {unit.code} · {unit.unit_type}
            </Text>
          </div>

          {unit.description && <Text size="sm">{unit.description}</Text>}

          <div className={styles.drawerSection}>
            <Text size="xs" c="dimmed" mb={4}>
              Path
            </Text>
            <Text size="sm">{unit.path_cache || "—"}</Text>
          </div>

          {ancestors && ancestors.length > 0 && (
            <div className={styles.drawerSection}>
              <Text size="xs" c="dimmed" mb={4}>
                Ancestors
              </Text>
              <List size="sm">
                {ancestors.map((ancestor) => (
                  <List.Item key={ancestor.id}>{ancestor.name}</List.Item>
                ))}
              </List>
            </div>
          )}

          {descendants && descendants.length > 0 && (
            <div className={styles.drawerSection}>
              <Text size="xs" c="dimmed" mb={4}>
                Descendants ({descendants.length})
              </Text>
              <List size="sm">
                {descendants.slice(0, 10).map((descendant) => (
                  <List.Item key={descendant.id}>{descendant.name}</List.Item>
                ))}
              </List>
              {descendants.length > 10 && (
                <Text size="xs" c="dimmed" mt={4}>
                  +{descendants.length - 10} more
                </Text>
              )}
            </div>
          )}

          <Divider />

          <Stack gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<PlusIcon size={13} />}
              onClick={() => openAddUnitModal(unit.id, unit.name)}
            >
              Add Child Unit
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<PencilSimpleIcon size={13} />}
              onClick={() => openEditUnitModal(unit.id)}
            >
              Edit Unit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="cyan"
              leftSection={<ArrowsOutCardinalIcon size={13} />}
              onClick={() => openMoveModal(unit.id, unit.name)}
            >
              Move Unit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<ProhibitIcon size={13} />}
              onClick={() => openDeactivateModal(unit.id, unit.name)}
            >
              Deactivate Unit
            </Button>
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
}
