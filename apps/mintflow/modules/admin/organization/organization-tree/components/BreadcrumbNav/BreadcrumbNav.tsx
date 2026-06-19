"use client";

import { Button, Group, Text } from "@peppermint/ui";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { CrosshairIcon } from "@phosphor-icons/react/dist/csr/Crosshair";

interface BreadcrumbNavProps {
  path: Array<{ id: string; label: string }>;
  onNavigate: (nodeId: string) => void;
  onExitFocus: () => void;
}

export function BreadcrumbNav({ path, onNavigate, onExitFocus }: BreadcrumbNavProps) {
  if (path.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        gap: 4,
        background: "var(--mantine-color-body)",
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 8,
        padding: "6px 10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        maxWidth: "calc(100% - 240px)",
        overflow: "hidden",
      }}
    >
      <CrosshairIcon size={13} color="var(--mantine-color-indigo-5)" aria-label="Focus mode" />
      <Group gap={2} wrap="nowrap" style={{ overflow: "hidden", flex: 1 }}>
        {path.map((item, i) => {
          const isLast = i === path.length - 1;
          return (
            <Group key={item.id} gap={2} wrap="nowrap" style={{ flexShrink: isLast ? 1 : 0 }}>
              {i > 0 && (
                <CaretRightIcon size={11} color="var(--mantine-color-dimmed)" aria-hidden />
              )}
              {isLast ? (
                <Text size="xs" fw={700} c="dark" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 160 }}>
                  {item.label}
                </Text>
              ) : (
                <Button
                  size="compact-xs"
                  variant="subtle"
                  color="indigo"
                  onClick={() => onNavigate(item.id)}
                  style={{ padding: "0 4px", height: "auto", minHeight: "auto", fontSize: 11 }}
                >
                  {item.label}
                </Button>
              )}
            </Group>
          );
        })}
      </Group>
      <Button
        size="compact-xs"
        variant="subtle"
        color="gray"
        leftSection={<XIcon size={11} aria-label="Exit focus" />}
        onClick={onExitFocus}
        style={{ padding: "0 6px", height: "auto", minHeight: "auto", fontSize: 11, flexShrink: 0 }}
      >
        Exit Focus
      </Button>
    </div>
  );
}
