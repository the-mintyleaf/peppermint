"use client";

import { Badge, Button, Group, Stack, Text } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ChildCard } from "../ChildCard";
import type { ChildGroupSectionProps } from "./ChildGroupSection.types";

export function ChildGroupSection({
  label,
  addLabel,
  children,
  onAdd,
  onEdit,
  onDelete,
  onSelectNode,
}: ChildGroupSectionProps) {
  return (
    <div>
      <Group justify="space-between" align="center" mb={8}>
        <Group gap={6}>
          <Text
            size="xs"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.06em", fontSize: 10 }}
          >
            {label}
          </Text>
          <Badge size="xs" variant="light" color="gray">
            {children.length}
          </Badge>
        </Group>
        <Button
          size="xs"
          variant="subtle"
          leftSection={<PlusIcon size={11} aria-label="Add" />}
          onClick={onAdd}
          style={{ fontSize: 11 }}
        >
          {addLabel}
        </Button>
      </Group>

      {children.length === 0 ? (
        <div
          style={{
            padding: "14px 12px",
            borderRadius: 8,
            border: "1px dashed var(--mantine-color-default-border)",
            textAlign: "center",
          }}
        >
          <Text size="xs" c="dimmed">
            No {label.toLowerCase()} yet
          </Text>
        </div>
      ) : (
        <Stack gap={6}>
          {children.map((node) => (
            <ChildCard
              key={node.id}
              node={node}
              onEdit={onEdit}
              onDelete={onDelete}
              onSelect={onSelectNode}
            />
          ))}
        </Stack>
      )}
    </div>
  );
}
