"use client";

import { Group, ActionIcon, Tooltip, Divider } from "@peppermint/ui";
import { CursorIcon } from "@phosphor-icons/react/dist/csr/Cursor";
import { TextTIcon } from "@phosphor-icons/react/dist/csr/TextT";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import { SquareIcon } from "@phosphor-icons/react/dist/csr/Square";
import { CircleIcon } from "@phosphor-icons/react/dist/csr/Circle";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { BracketsCurlyIcon } from "@phosphor-icons/react/dist/csr/BracketsCurly";
import { TextAaIcon } from "@phosphor-icons/react/dist/csr/TextAa";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { BuilderTool } from "../../templateForm.types";

interface ToolDef {
  tool: BuilderTool;
  label: string;
  icon: React.ReactNode;
  isCreate?: boolean;
}

const TOOLS: ToolDef[] = [
  {
    tool: "select",
    label: "Select / Move",
    icon: <CursorIcon size={16} weight="bold" />,
  },
  {
    tool: "text",
    label: "Text",
    icon: <TextTIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "image",
    label: "Image",
    icon: <ImageIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "rectangle",
    label: "Rectangle",
    icon: <SquareIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "circle",
    label: "Circle",
    icon: <CircleIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "line",
    label: "Line",
    icon: <MinusIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "dynamicText",
    label: "Dynamic Text",
    icon: <BracketsCurlyIcon size={16} weight="bold" />,
    isCreate: true,
  },
  {
    tool: "staticText",
    label: "Static Text",
    icon: <TextAaIcon size={16} weight="bold" />,
    isCreate: true,
  },
];

function ToolButton({ def }: { def: ToolDef }) {
  const { activeTool, setActiveTool } = useBuilderStore();
  const isActive = activeTool === def.tool;

  function handleClick() {
    setActiveTool(def.tool);
  }

  return (
    <Tooltip label={def.label} withArrow position="top">
      <ActionIcon
        size="md"
        variant="subtle"
        aria-label={def.label}
        onClick={handleClick}
        style={{
          color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
          background: isActive ? "#0D99FF" : "transparent",
          borderRadius: 8,
        }}
      >
        {def.icon}
      </ActionIcon>
    </Tooltip>
  );
}

export function CanvasToolbar() {
  const selectTool = TOOLS[0];
  const createTools = TOOLS.slice(1);

  return (
    <Group
      gap={4}
      px="xs"
      py={6}
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#2C2C2C",
        borderRadius: 12,
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
        zIndex: 10,
        userSelect: "none",
      }}
    >
      <ToolButton def={selectTool} />
      <Divider orientation="vertical" color="rgba(255,255,255,0.15)" />
      {createTools.map((def) => (
        <ToolButton key={def.tool} def={def} />
      ))}
    </Group>
  );
}
