"use client";

import { Box, Stack, Text, TextInput, Select, Switch, NumberInput, Textarea, ColorInput, Divider } from "@zetsel/ui";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { SlotElement, RectangleElement, TextStaticElement, DividerElement } from "../../templateForm.types";
import { PLATFORM_LABELS } from "../../../module.api";
import type { PlatformFormat } from "../../../module.api";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function SlotInspector({ el }: { el: SlotElement }) {
  const { updateElement, elements } = useBuilderStore();
  const existingNames = elements.filter((e) => e.id !== el.id && e.kind === "slot").map((e) => (e as SlotElement).slotName);
  const nameError = existingNames.includes(el.slotName) ? "Slot name must be unique" : undefined;

  return (
    <Stack gap="sm">
      <TextInput
        label="Slot name"
        value={el.slotName}
        error={nameError}
        onChange={(e) => updateElement(el.id, { slotName: slugify(e.target.value) } as Partial<SlotElement>)}
        size="xs"
        ff="monospace"
      />
      <Select
        label="Slot type"
        value={el.slotType}
        onChange={(v) => updateElement(el.id, { slotType: v } as Partial<SlotElement>)}
        data={["text", "image_url", "color", "number"]}
        size="xs"
      />
      <TextInput
        label="Label"
        value={el.label}
        onChange={(e) => updateElement(el.id, { label: e.target.value } as Partial<SlotElement>)}
        size="xs"
      />
      <Switch
        label="Required"
        checked={el.required}
        onChange={(e) => updateElement(el.id, { required: e.target.checked } as Partial<SlotElement>)}
        size="xs"
      />
      {el.slotType === "text" && (
        <NumberInput
          label="Max characters"
          value={el.maxChars ?? ""}
          onChange={(v) => updateElement(el.id, { maxChars: v ? Number(v) : undefined } as Partial<SlotElement>)}
          size="xs"
          min={1}
        />
      )}
      <TextInput
        label="Placeholder"
        value={el.placeholder ?? ""}
        onChange={(e) => updateElement(el.id, { placeholder: e.target.value } as Partial<SlotElement>)}
        size="xs"
      />
    </Stack>
  );
}

function StaticInspector({ el }: { el: RectangleElement | TextStaticElement | DividerElement }) {
  const { updateElement } = useBuilderStore();

  return (
    <Stack gap="sm">
      <NumberInput label="X" value={el.x} onChange={(v) => updateElement(el.id, { x: Number(v) })} size="xs" />
      <NumberInput label="Y" value={el.y} onChange={(v) => updateElement(el.id, { y: Number(v) })} size="xs" />
      <NumberInput label="Width" value={el.width} onChange={(v) => updateElement(el.id, { width: Number(v) })} size="xs" />
      <NumberInput label="Height" value={el.height} onChange={(v) => updateElement(el.id, { height: Number(v) })} size="xs" />

      {el.kind === "rectangle" && (
        <>
          <Divider />
          <ColorInput label="Fill" value={el.fill} onChange={(v) => updateElement(el.id, { fill: v } as Partial<RectangleElement>)} size="xs" />
          <NumberInput label="Border radius" value={el.borderRadius} onChange={(v) => updateElement(el.id, { borderRadius: Number(v) } as Partial<RectangleElement>)} size="xs" min={0} />
          <NumberInput label="Border width" value={el.borderWidth} onChange={(v) => updateElement(el.id, { borderWidth: Number(v) } as Partial<RectangleElement>)} size="xs" min={0} />
          <ColorInput label="Border color" value={el.borderColor} onChange={(v) => updateElement(el.id, { borderColor: v } as Partial<RectangleElement>)} size="xs" />
        </>
      )}

      {el.kind === "text_static" && (
        <>
          <Divider />
          <Textarea label="Content" value={el.content} onChange={(e) => updateElement(el.id, { content: e.target.value } as Partial<TextStaticElement>)} size="xs" autosize minRows={2} />
          <NumberInput label="Font size" value={el.fontSize} onChange={(v) => updateElement(el.id, { fontSize: Number(v) } as Partial<TextStaticElement>)} size="xs" min={8} />
          <Select label="Font weight" value={String(el.fontWeight)} onChange={(v) => updateElement(el.id, { fontWeight: Number(v) } as Partial<TextStaticElement>)} data={["300", "400", "500", "600", "700", "800"]} size="xs" />
          <ColorInput label="Color" value={el.color} onChange={(v) => updateElement(el.id, { color: v } as Partial<TextStaticElement>)} size="xs" />
          <Select label="Align" value={el.textAlign} onChange={(v) => updateElement(el.id, { textAlign: v as "left" | "center" | "right" } as Partial<TextStaticElement>)} data={["left", "center", "right"]} size="xs" />
        </>
      )}

      {el.kind === "divider" && (
        <>
          <Divider />
          <ColorInput label="Color" value={el.color} onChange={(v) => updateElement(el.id, { color: v } as Partial<DividerElement>)} size="xs" />
          <NumberInput label="Thickness" value={el.thickness} onChange={(v) => updateElement(el.id, { thickness: Number(v) } as Partial<DividerElement>)} size="xs" min={1} />
        </>
      )}
    </Stack>
  );
}

function TemplateSettingsPanel() {
  const { templateMeta, setTemplateMeta, setPlatform } = useBuilderStore();

  return (
    <Stack gap="sm">
      <TextInput
        label="Template name"
        value={templateMeta.name}
        onChange={(e) => setTemplateMeta({ name: e.target.value })}
        size="xs"
      />
      <Textarea
        label="Description"
        value={templateMeta.description}
        onChange={(e) => setTemplateMeta({ description: e.target.value })}
        size="xs"
        autosize
        minRows={2}
      />
      <Select
        label="Platform"
        value={templateMeta.platform}
        onChange={(v) => setPlatform(v as PlatformFormat)}
        data={Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label }))}
        size="xs"
      />
      <NumberInput
        label="Width (px)"
        value={templateMeta.width}
        onChange={(v) => setTemplateMeta({ width: Number(v) })}
        size="xs"
      />
      <NumberInput
        label="Height (px)"
        value={templateMeta.height}
        onChange={(v) => setTemplateMeta({ height: Number(v) })}
        size="xs"
      />
    </Stack>
  );
}

export function Inspector() {
  const { elements, selectedElementId, removeElement } = useBuilderStore();
  const selected = elements.find((el) => el.id === selectedElementId);

  return (
    <Box
      style={{
        width: 260,
        borderLeft: "1px solid var(--mantine-color-default-border)",
        overflowY: "auto",
        flexShrink: 0,
      }}
      p="sm"
    >
      <Stack gap="xs">
        {!selected && (
          <>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
              Template Settings
            </Text>
            <TemplateSettingsPanel />
          </>
        )}

        {selected && selected.kind === "slot" && (
          <>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
              Slot Properties
            </Text>
            <SlotInspector el={selected as SlotElement} />
          </>
        )}

        {selected && selected.kind !== "slot" && (
          <>
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts={0.5}>
              Element Properties
            </Text>
            <StaticInspector el={selected as RectangleElement | TextStaticElement | DividerElement} />
          </>
        )}

        {selected && (
          <>
            <Divider />
            <Text
              size="xs"
              c="red"
              style={{ cursor: "pointer" }}
              onClick={() => removeElement(selected.id)}
            >
              Remove element
            </Text>
          </>
        )}
      </Stack>
    </Box>
  );
}
