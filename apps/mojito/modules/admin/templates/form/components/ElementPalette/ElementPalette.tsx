"use client";

import { Stack, Text, Box, Divider } from "@zetsel/ui";

interface PaletteItem {
  kind: string;
  label: string;
  description: string;
}

const SLOT_ITEMS: PaletteItem[] = [
  { kind: "slot_text", label: "Text Slot", description: "AI-filled text" },
  { kind: "slot_image", label: "Image Slot", description: "AI-filled image" },
  { kind: "slot_color", label: "Color Slot", description: "AI-filled color" },
  { kind: "slot_number", label: "Number Slot", description: "AI-filled number" },
];

const STATIC_ITEMS: PaletteItem[] = [
  { kind: "rectangle", label: "Rectangle", description: "Static shape" },
  { kind: "divider", label: "Divider", description: "Horizontal line" },
  { kind: "brand_logo", label: "Brand Logo", description: "Logo placeholder" },
  { kind: "text_static", label: "Static Text", description: "Fixed text" },
];

function DraggableItem({ item }: { item: PaletteItem }) {
  return (
    <Box
      draggable
      onDragStart={(e) => e.dataTransfer.setData("element-kind", item.kind)}
      p="xs"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: 6,
        cursor: "grab",
        background: "var(--mantine-color-body)",
        userSelect: "none",
      }}
    >
      <Text size="xs" fw={500}>
        {item.label}
      </Text>
      <Text size="xs" c="dimmed">
        {item.description}
      </Text>
    </Box>
  );
}

export function ElementPalette() {
  return (
    <Box
      style={{
        width: 200,
        borderRight: "1px solid var(--mantine-color-default-border)",
        overflowY: "auto",
        flexShrink: 0,
      }}
      p="sm"
    >
      <Stack gap="xs">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
          Slots
        </Text>
        {SLOT_ITEMS.map((item) => (
          <DraggableItem key={item.kind} item={item} />
        ))}
        <Divider my={4} />
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
          Static
        </Text>
        {STATIC_ITEMS.map((item) => (
          <DraggableItem key={item.kind} item={item} />
        ))}
      </Stack>
    </Box>
  );
}
