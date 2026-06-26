"use client";

import { Box, Group, Text, ActionIcon, Tooltip } from "@peppermint/ui";
import { SidebarSimpleIcon } from "@phosphor-icons/react/dist/csr/SidebarSimple";

interface CollapsedPanelBubbleProps {
  side: "left" | "right";
  width: number;
  label: string;
  icon: React.ReactNode;
  onExpand: () => void;
  expandLabel: string;
}

export function CollapsedPanelBubble({
  side,
  width,
  label,
  icon,
  onExpand,
  expandLabel,
}: CollapsedPanelBubbleProps) {
  return (
    <Box
      style={{
        position: "absolute",
        top: 0,
        left: side === "left" ? 0 : undefined,
        right: side === "right" ? 0 : undefined,
        width,
        zIndex: 20,
        pointerEvents: "auto",
      }}
    >
      <Group
        gap={6}
        wrap="nowrap"
        align="center"
        justify="space-between"
        style={{
          width: "100%",
          padding: "6px 8px",
          boxSizing: "border-box",
          background: "var(--mantine-color-body)",
          border: "1px solid var(--mantine-color-default-border)",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Group
          gap={6}
          wrap="nowrap"
          align="center"
          style={{ flex: 1, minWidth: 0 }}
        >
          <Box style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            {icon}
          </Box>
          <Text
            fw={500}
            truncate
            style={{ minWidth: 0, fontSize: 10, lineHeight: 1.2 }}
          >
            {label}
          </Text>
        </Group>
        <Tooltip label={expandLabel} withArrow>
          <ActionIcon
            size="sm"
            variant="subtle"
            onClick={onExpand}
            aria-label={expandLabel}
            style={{ flexShrink: 0 }}
          >
            <SidebarSimpleIcon
              size={14}
              style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
            />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Box>
  );
}
