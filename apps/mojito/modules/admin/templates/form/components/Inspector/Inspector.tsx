"use client";

import {
  Box,
  Stack,
  Text,
  TextInput,
  Select,
  NumberInput,
  Textarea,
  ColorInput,
  Divider,
  Group,
  Popover,
} from "@zetsel/ui";
import { useBuilderStore } from "../../TemplateBuilder.store";
import type { CanvasElement } from "../../templateForm.types";
import { getElementTypeLabel } from "../../elementDefaults";
import { PLATFORM_LABELS } from "../../../module.api";
import type { PlatformFormat } from "../../../module.api";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text size="xs" fw={600} c="dimmed" mt={4}>
      {children}
    </Text>
  );
}

function DimInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <NumberInput
      size="xs"
      hideControls
      value={value}
      onChange={(v) => onChange(Number(v))}
      styles={{
        input: { paddingLeft: 28, textAlign: "right" },
      }}
      leftSection={
        <Text size="xs" c="dimmed" pl={4}>
          {label}
        </Text>
      }
      leftSectionWidth={24}
    />
  );
}

function ColorIndicator({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const hex = value.replace("#", "").toUpperCase();

  return (
    <Group gap={8} wrap="nowrap">
      <Popover position="bottom-start" withArrow shadow="md">
        <Popover.Target>
          <Box
            aria-label={`Color ${hex}`}
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: value,
              border: "1px solid var(--mantine-color-default-border)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          />
        </Popover.Target>
        <Popover.Dropdown p="xs">
          <ColorInput
            size="xs"
            value={value}
            onChange={onChange}
            format="hex"
            swatches={["#000000", "#ffffff", "#f3f4f6", "#3b82f6", "#ef4444", "#22c55e"]}
          />
        </Popover.Dropdown>
      </Popover>
      <Text size="xs" c="dimmed" ff="monospace" tt="uppercase">
        {hex}
      </Text>
    </Group>
  );
}

function isTextType(type: CanvasElement["type"]): boolean {
  return type === "text" || type === "staticText" || type === "dynamicText";
}

function supportsFill(type: CanvasElement["type"]): boolean {
  return type === "rectangle" || type === "circle" || type === "line" || type === "image" || isTextType(type);
}

function supportsStroke(type: CanvasElement["type"]): boolean {
  return type === "rectangle" || type === "circle" || type === "image";
}

function supportsRadius(type: CanvasElement["type"]): boolean {
  return type === "rectangle" || type === "image" || type === "dynamicText";
}

function ElementPropertiesPanel({ el }: { el: CanvasElement }) {
  const { updateElement, elements } = useBuilderStore();

  const existingDataKeys = elements
    .filter((e) => e.id !== el.id && e.type === "dynamicText")
    .map((e) => e.props.dataKey)
    .filter(Boolean);

  const dataKeyError =
    el.type === "dynamicText" && el.props.dataKey && existingDataKeys.includes(el.props.dataKey)
      ? "Data key must be unique"
      : undefined;

  function updateProps(patch: Partial<CanvasElement["props"]>) {
    updateElement(el.id, { props: { ...el.props, ...patch } });
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={600}>
        {getElementTypeLabel(el.type)}
      </Text>

      <TextInput
        size="xs"
        placeholder="Purpose"
        value={el.purpose}
        onChange={(e) => updateElement(el.id, { purpose: e.target.value })}
        styles={{ input: { background: "var(--mantine-color-gray-0)" } }}
      />

      <SectionLabel>Layout</SectionLabel>
      <Group gap={6} grow>
        <DimInput label="W" value={el.width} onChange={(width) => updateElement(el.id, { width })} />
        <DimInput label="H" value={el.height} onChange={(height) => updateElement(el.id, { height })} />
      </Group>

      <SectionLabel>Appearance</SectionLabel>
      <Group gap={6} grow>
        <NumberInput
          size="xs"
          hideControls
          value={el.props.opacity ?? 100}
          onChange={(v) => updateProps({ opacity: Number(v) })}
          min={0}
          max={100}
          suffix="%"
          styles={{ input: { textAlign: "right" } }}
          leftSection={
            <Text size="xs" c="dimmed" pl={4}>
              ◐
            </Text>
          }
          leftSectionWidth={24}
        />
        {supportsRadius(el.type) && (
          <NumberInput
            size="xs"
            hideControls
            value={el.props.borderRadius ?? 0}
            onChange={(v) => updateProps({ borderRadius: Number(v) })}
            min={0}
            styles={{ input: { paddingLeft: 28, textAlign: "right" } }}
            leftSection={
              <Text size="xs" c="dimmed" pl={4}>
                ◻
              </Text>
            }
            leftSectionWidth={24}
          />
        )}
      </Group>

      {supportsFill(el.type) && (
        <>
          <SectionLabel>Fill</SectionLabel>
          <ColorIndicator
            value={el.props.fill ?? (isTextType(el.type) ? "#000000" : "#f3f4f6")}
            onChange={(fill) => updateProps({ fill })}
          />
        </>
      )}

      {supportsStroke(el.type) && (
        <>
          <SectionLabel>Stroke</SectionLabel>
          <ColorIndicator value={el.props.stroke ?? "#000000"} onChange={(stroke) => updateProps({ stroke })} />
          <Group gap={6} grow>
            <NumberInput
              size="xs"
              hideControls
              value={el.props.strokeWidth ?? 0}
              onChange={(v) => updateProps({ strokeWidth: Number(v) })}
              min={0}
              styles={{ input: { paddingLeft: 28, textAlign: "right" } }}
              leftSection={
                <Text size="xs" c="dimmed" pl={4}>
                  W
                </Text>
              }
              leftSectionWidth={24}
            />
          </Group>
        </>
      )}

      {isTextType(el.type) && (
        <>
          <SectionLabel>Content</SectionLabel>
          <Textarea
            size="xs"
            value={el.props.text ?? ""}
            onChange={(e) => updateProps({ text: e.target.value })}
            autosize
            minRows={2}
            styles={{ input: { background: "var(--mantine-color-gray-0)" } }}
          />
          <Group gap={6} grow>
            <NumberInput
              size="xs"
              hideControls
              value={el.props.fontSize ?? 32}
              onChange={(v) => updateProps({ fontSize: Number(v) })}
              min={8}
              styles={{ input: { paddingLeft: 28, textAlign: "right" } }}
              leftSection={
                <Text size="xs" c="dimmed" pl={4}>
                  Aa
                </Text>
              }
              leftSectionWidth={28}
            />
          </Group>
        </>
      )}

      {el.type === "dynamicText" && (
        <>
          <SectionLabel>Data key</SectionLabel>
          <TextInput
            size="xs"
            value={el.props.dataKey ?? ""}
            error={dataKeyError}
            onChange={(e) => updateProps({ dataKey: slugify(e.target.value) })}
            ff="monospace"
            styles={{ input: { background: "var(--mantine-color-gray-0)" } }}
          />
        </>
      )}

      {el.type === "image" && (
        <>
          <SectionLabel>Image</SectionLabel>
          <TextInput
            size="xs"
            placeholder="Image URL"
            value={el.props.imageUrl ?? ""}
            onChange={(e) => updateProps({ imageUrl: e.target.value })}
            styles={{ input: { background: "var(--mantine-color-gray-0)" } }}
          />
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
      <Group gap={6} grow>
        <NumberInput
          label="Width"
          value={templateMeta.width}
          onChange={(v) => setTemplateMeta({ width: Number(v) })}
          size="xs"
        />
        <NumberInput
          label="Height"
          value={templateMeta.height}
          onChange={(v) => setTemplateMeta({ height: Number(v) })}
          size="xs"
        />
      </Group>
    </Stack>
  );
}

export function Inspector() {
  const { elements, selectedElementId, removeElement } = useBuilderStore();
  const selected = elements.find((el) => el.id === selectedElementId);

  return (
    <Box
      style={{
        height: "100%",
        overflowY: "auto",
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

        {selected && (
          <>
            <ElementPropertiesPanel el={selected} />
            <Divider my="xs" />
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
