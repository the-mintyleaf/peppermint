"use client";

import { Group, ActionIcon, Tooltip, Text } from "@zetsel/ui";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useBuilderStore } from "../../TemplateBuilder.store";
import { zoomPercent } from "../../canvas.constants";

export function CanvasZoomControls() {
  const { canvasZoom, zoomIn, zoomOut, resetCanvasZoom } = useBuilderStore();

  return (
    <Group
      gap={4}
      px={6}
      py={4}
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        background: "#2C2C2C",
        borderRadius: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        zIndex: 10,
        userSelect: "none",
      }}
    >
      <Tooltip label="Zoom out" withArrow position="top">
        <ActionIcon
          size="sm"
          variant="subtle"
          aria-label="Zoom out"
          onClick={zoomOut}
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          <MinusIcon size={14} weight="bold" />
        </ActionIcon>
      </Tooltip>

      <Tooltip label="Reset zoom" withArrow position="top">
        <Text
          size="xs"
          fw={500}
          style={{
            color: "rgba(255,255,255,0.85)",
            minWidth: 40,
            textAlign: "center",
            cursor: "pointer",
            lineHeight: 1.2,
          }}
          onClick={resetCanvasZoom}
        >
          {zoomPercent(canvasZoom)}%
        </Text>
      </Tooltip>

      <Tooltip label="Zoom in" withArrow position="top">
        <ActionIcon
          size="sm"
          variant="subtle"
          aria-label="Zoom in"
          onClick={zoomIn}
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          <PlusIcon size={14} weight="bold" />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
