"use client";

import Link from "next/link";
import {
  ActionIcon,
  Badge,
  Button,
  CloseButton,
  Group,
  Loader,
  Menu,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  useReducedMotion,
} from "@peppermint/ui";
import { ArrowsOutCardinalIcon } from "@phosphor-icons/react/dist/csr/ArrowsOutCardinal";
import { ClockCounterClockwiseIcon } from "@phosphor-icons/react/dist/csr/ClockCounterClockwise";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { StackIcon } from "@phosphor-icons/react/dist/csr/Stack";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { BilingualName } from "../../../_shared/components/BilingualName";
import type { UnitStatus } from "../../../_shared/organization.types";
import { useStructureData } from "../../../_shared/structure-data";
import {
  useUnitAncestors,
  useUnitDescendants,
  useUnitDetail,
} from "../../Structure.hooks";
import { useStructureStore } from "../../Structure.store";
import styles from "./InspectorPanel.module.css";
import type { SectionCardProps } from "./InspectorPanel.types";

const UNIT_STATUS_COLORS: Record<UnitStatus, string> = {
  draft: "gray",
  active: "green",
  inactive: "yellow",
  merged: "blue",
  split: "blue",
  renamed: "blue",
  archived: "dark",
};

function SectionCard({ icon, title, children }: SectionCardProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <ThemeIcon size="sm" variant="light" color="gray" radius="sm">
          {icon}
        </ThemeIcon>
        <span className={styles.sectionTitle}>{title}</span>
      </div>
      {children}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export function InspectorPanel() {
  const reducedMotion = useReducedMotion();
  const { orgId } = useStructureData();
  const {
    selectedUnitId,
    panelOpen,
    closePanel,
    openAddUnitModal,
    openEditUnitModal,
    openMoveModal,
    openDeactivateModal,
    openAddMemberModal,
  } = useStructureStore();

  const {
    data: unit,
    isLoading,
    isError,
    refetch,
  } = useUnitDetail(selectedUnitId);
  const { data: ancestors } = useUnitAncestors(selectedUnitId);
  const { data: descendants } = useUnitDescendants(selectedUnitId);

  if (!panelOpen || !selectedUnitId) return null;

  const panelClass = `${styles.panel} ${
    reducedMotion ? "" : styles.panelAnimated
  }`;

  if (isLoading || (!unit && !isError)) {
    return (
      <aside className={panelClass} aria-label="Unit details">
        <ChromeHeader onClose={closePanel} />
        <div className={styles.centerState}>
          <Loader size="sm" />
        </div>
      </aside>
    );
  }

  if (isError || !unit) {
    return (
      <aside className={panelClass} aria-label="Unit details">
        <ChromeHeader onClose={closePanel} />
        <div className={styles.centerState}>
          <ThemeIcon size="lg" variant="light" color="red" radius="md">
            <WarningCircleIcon size={20} />
          </ThemeIcon>
          <Text size="sm" fw={600}>
            Couldn&apos;t load this unit
          </Text>
          <Text size="xs" c="dimmed">
            The unit details failed to load.
          </Text>
          <Button size="xs" variant="light" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={panelClass} aria-label="Unit details">
      <header className={styles.header}>
        <Group gap="xs" wrap="nowrap" align="flex-start">
          <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
            <Text className={styles.eyebrow} c="dimmed" fw={600} tt="uppercase">
              {unit.unit_type}
            </Text>
            <BilingualName
              np={unit.name_np}
              en={unit.name_en}
              size="sm"
              fw={700}
            />
            <Group gap={6} wrap="nowrap">
              <Badge
                size="xs"
                variant="dot"
                color={UNIT_STATUS_COLORS[unit.status]}
              >
                {unit.status}
              </Badge>
              <Text size="xs" c="dimmed" truncate>
                {unit.code}
              </Text>
            </Group>
          </Stack>

          <Group gap={2} wrap="nowrap">
            <Menu position="bottom-end" shadow="md" withArrow>
              <Menu.Target>
                <ActionIcon
                  size="sm"
                  variant="light"
                  aria-label="Add to this unit"
                >
                  <PlusIcon size={15} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Add</Menu.Label>
                <Menu.Item
                  leftSection={<PlusIcon size={14} />}
                  onClick={() => openAddUnitModal(unit.id, unit.name_np)}
                >
                  Add child unit
                </Menu.Item>
                <Menu.Item
                  leftSection={<UsersThreeIcon size={14} />}
                  onClick={() => openAddMemberModal(unit.id, unit.name_np)}
                >
                  Add member
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <Menu position="bottom-end" shadow="md" withArrow>
              <Menu.Target>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  aria-label="More actions"
                >
                  <DotsThreeVerticalIcon size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<PencilSimpleIcon size={14} />}
                  onClick={() => openEditUnitModal(unit.id)}
                >
                  Edit unit
                </Menu.Item>
                <Menu.Item
                  leftSection={<ArrowsOutCardinalIcon size={14} />}
                  onClick={() => openMoveModal(unit.id, unit.name_np)}
                >
                  Move unit
                </Menu.Item>
                <Menu.Item
                  component={Link}
                  href={`/admin/organization/${orgId}/event-log?unit=${unit.id}`}
                  leftSection={<ClockCounterClockwiseIcon size={14} />}
                >
                  View history
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<ProhibitIcon size={14} />}
                  onClick={() => openDeactivateModal(unit.id, unit.name_np)}
                >
                  Deactivate unit
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>

            <CloseButton onClick={closePanel} aria-label="Close details" />
          </Group>
        </Group>
      </header>

      <ScrollArea className={styles.body} scrollbarSize={6}>
        <div className={styles.bodyInner}>
          <SectionCard icon={<InfoIcon size={13} />} title="About">
            <Stack gap={10}>
              {unit.description && <Text size="sm">{unit.description}</Text>}
              <div>
                <Text size="xs" c="dimmed" mb={2}>
                  Path
                </Text>
                <Text size="sm">{unit.path_cache || "—"}</Text>
              </div>
            </Stack>
          </SectionCard>

          <SectionCard icon={<UsersThreeIcon size={13} />} title="At a glance">
            <div className={styles.statRow}>
              <Stat value={descendants?.length ?? 0} label="Descendants" />
              <Stat value={ancestors?.length ?? 0} label="Ancestors" />
              <Stat value={unit.depth} label="Depth" />
            </div>
          </SectionCard>

          {ancestors && ancestors.length > 0 && (
            <SectionCard
              icon={<StackIcon size={13} />}
              title={`Ancestors (${ancestors.length})`}
            >
              {ancestors.map((ancestor) => (
                <div key={ancestor.id} className={styles.listRow}>
                  <BilingualName
                    np={ancestor.name_np}
                    en={ancestor.name_en}
                    inline
                  />
                </div>
              ))}
            </SectionCard>
          )}

          {descendants && descendants.length > 0 && (
            <SectionCard
              icon={<TreeStructureIcon size={13} />}
              title={`Descendants (${descendants.length})`}
            >
              {descendants.slice(0, 10).map((descendant) => (
                <div key={descendant.id} className={styles.listRow}>
                  <BilingualName
                    np={descendant.name_np}
                    en={descendant.name_en}
                    inline
                  />
                </div>
              ))}
              {descendants.length > 10 && (
                <Text size="xs" c="dimmed" mt={6}>
                  +{descendants.length - 10} more
                </Text>
              )}
            </SectionCard>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}

function ChromeHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className={styles.header}>
      <Group gap="xs" justify="space-between" wrap="nowrap">
        <Text size="sm" fw={700}>
          Unit details
        </Text>
        <CloseButton onClick={onClose} aria-label="Close details" />
      </Group>
    </header>
  );
}
