"use client";

import { useState } from "react";
import { Box, Group, Text, ActionIcon, Stack, Tooltip } from "@peppermint/ui";
import { SidebarSimpleIcon } from "@phosphor-icons/react/dist/csr/SidebarSimple";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { LockIcon } from "@phosphor-icons/react/dist/csr/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/dist/csr/LockOpen";
import { TextTIcon } from "@phosphor-icons/react/dist/csr/TextT";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import { SquareIcon } from "@phosphor-icons/react/dist/csr/Square";
import { CircleIcon } from "@phosphor-icons/react/dist/csr/Circle";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { BracketsCurlyIcon } from "@phosphor-icons/react/dist/csr/BracketsCurly";
import { TextAaIcon } from "@phosphor-icons/react/dist/csr/TextAa";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { ElementType } from "../../templateForm.types";

function ElementTypeIcon({ type }: { type: ElementType }) {
  const iconProps = {
    size: 14,
    weight: "fill" as const,
    color: "var(--mantine-color-dimmed)",
  };

  switch (type) {
    case "text":
      return <TextTIcon {...iconProps} />;
    case "image":
      return <ImageIcon {...iconProps} />;
    case "rectangle":
      return <SquareIcon {...iconProps} />;
    case "circle":
      return <CircleIcon {...iconProps} />;
    case "line":
      return <MinusIcon {...iconProps} />;
    case "dynamicText":
      return <BracketsCurlyIcon {...iconProps} />;
    case "staticText":
      return <TextAaIcon {...iconProps} />;
  }
}

interface LayersPanelProps {
  onCollapse?: () => void;
}

export function LayersPanel({ onCollapse }: LayersPanelProps) {
  const {
    elements,
    selectedElementId,
    selectElement,
    reorderLayers,
    toggleVisible,
    toggleLocked,
  } = useBuilderStore();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
    >
      <Group
        justify="space-between"
        wrap="nowrap"
        align="center"
        px="sm"
        pt="sm"
        pb="xs"
      >
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
          Layers
        </Text>
        {onCollapse && (
          <Tooltip label="Hide layers" withArrow>
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={onCollapse}
              aria-label="Hide layers panel"
            >
              <SidebarSimpleIcon size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {sortedLayers.length === 0 ? (
        <Text size="xs" c="dimmed" px="sm">
          No elements yet
        </Text>
      ) : (
        <Stack gap={0}>
          {sortedLayers.map((el, index) => {
            const isSelected = selectedElementId === el.id;
            const showActions =
              isSelected || hoveredId === el.id || !el.visible || el.locked;
            return (
              <Box
                key={el.id}
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                onClick={() => selectElement(el.id)}
                onMouseEnter={() => setHoveredId(el.id)}
                onMouseLeave={() => setHoveredId(null)}
                py={4}
                style={{
                  width: "100%",
                  cursor: "pointer",
                  background: isSelected ? "rgba(13,153,255,0.08)" : undefined,
                  opacity: el.visible ? 1 : 0.5,
                }}
              >
                <Group
                  gap={6}
                  justify="space-between"
                  wrap="nowrap"
                  align="center"
                  px="sm"
                >
                  <Group
                    gap={6}
                    wrap="nowrap"
                    align="center"
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <Box
                      style={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <ElementTypeIcon type={el.type} />
                    </Box>
                    <Text
                      size="xs"
                      truncate
                      fw={500}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {el.purpose}
                    </Text>
                  </Group>
                  <Group
                    gap={2}
                    wrap="nowrap"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      opacity: showActions ? 1 : 0,
                      pointerEvents: showActions ? "auto" : "none",
                      transition: "opacity 120ms ease",
                    }}
                  >
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      aria-label={el.visible ? "Hide layer" : "Show layer"}
                      onClick={() => toggleVisible(el.id)}
                    >
                      {el.visible ? (
                        <EyeIcon size={12} />
                      ) : (
                        <EyeSlashIcon size={12} />
                      )}
                    </ActionIcon>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      aria-label={el.locked ? "Unlock layer" : "Lock layer"}
                      onClick={() => toggleLocked(el.id)}
                    >
                      {el.locked ? (
                        <LockIcon size={12} />
                      ) : (
                        <LockOpenIcon size={12} />
                      )}
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
