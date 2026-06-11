"use client";

import { useState } from "react";
import { Box, Group, Text, ActionIcon, Stack } from "@zetsel/ui";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { LockIcon } from "@phosphor-icons/react/dist/csr/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/dist/csr/LockOpen";
import { useBuilderStore } from "../../TemplateBuilder.store";
import { getElementTypeLabel } from "../../elementDefaults";

export function LayersPanel() {
  const { elements, selectedElementId, selectElement, reorderLayers, toggleVisible, toggleLocked } =
    useBuilderStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const sortedLayers = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }

    const ids = sortedLayers.map((el) => el.id);
    const [moved] = ids.splice(dragIndex, 1);
    ids.splice(targetIndex, 0, moved);
    reorderLayers(ids);
    setDragIndex(null);
  }

  return (
    <Box
      style={{
        height: "100%",
        overflowY: "auto",
      }}
      p="sm"
    >
      <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5} mb="xs">
        Layers
      </Text>

      {sortedLayers.length === 0 ? (
        <Text size="xs" c="dimmed">
          No elements yet
        </Text>
      ) : (
        <Stack gap={4}>
          {sortedLayers.map((el, index) => {
            const isSelected = selectedElementId === el.id;
            return (
              <Box
                key={el.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onClick={() => selectElement(el.id)}
                px="xs"
                py={4}
                style={{
                  borderRadius: 6,
                  cursor: "pointer",
                  border: isSelected
                    ? "1px solid var(--mantine-color-blue-6)"
                    : "1px solid var(--mantine-color-default-border)",
                  background: isSelected ? "rgba(13,153,255,0.08)" : "var(--mantine-color-body)",
                  opacity: el.visible ? 1 : 0.5,
                }}
              >
                <Group gap={6} justify="space-between" wrap="nowrap" align="center">
                  <Text size="xs" truncate style={{ flex: 1, minWidth: 0 }}>
                    <Text span fw={500}>
                      {el.purpose}
                    </Text>
                    <Text span c="dimmed">
                      {" · "}
                      {getElementTypeLabel(el.type)}
                    </Text>
                  </Text>
                  <Group gap={2} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      aria-label={el.visible ? "Hide layer" : "Show layer"}
                      onClick={() => toggleVisible(el.id)}
                    >
                      {el.visible ? <EyeIcon size={12} /> : <EyeSlashIcon size={12} />}
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      aria-label={el.locked ? "Unlock layer" : "Lock layer"}
                      onClick={() => toggleLocked(el.id)}
                    >
                      {el.locked ? <LockIcon size={12} /> : <LockOpenIcon size={12} />}
                    </ActionIcon>
                  </Group>
                </Group>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
