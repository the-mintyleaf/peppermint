"use client";

import { useState, useRef, useEffect } from "react";
import {
  Slider,
  NumberInput,
  Text,
  Stack,
  Group,
  useDebouncedCallback,
} from "@peppermint/ui";
import type {
  DocumentConfigBarProps,
  BankContent,
} from "../../documents.types";

const inputStyles = {
  label: { fontSize: "var(--mantine-font-size-xs)" },
  input: {
    fontSize: "var(--mantine-font-size-xs)",
    minHeight: 24,
    height: 24,
    padding: "0 6px",
  },
};

const ATTR = "data-bank-padding-active";

export function BankConfigBar({
  document: doc,
  onUpdate,
  disabled,
}: DocumentConfigBarProps) {
  const content = doc.content as BankContent;
  // Latest-content ref read by debounced update callbacks (not during render).
  const contentRef = useRef(content);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;

  const hp = (content.headerProps ?? {}) as Record<string, unknown>;
  const [paddingTop, setPaddingTop] = useState<number>(
    (hp.height as number) ?? 1,
  );
  const [paddingBottom, setPaddingBottom] = useState<number>(
    (hp.paddingBottom as number) ?? 0.5,
  );

  useEffect(() => {
    return () => {
      globalThis.document?.body.removeAttribute(ATTR);
    };
  }, []);

  const debouncedUpdate = useDebouncedCallback(
    (top: number, bottom: number) => {
      const c = contentRef.current as BankContent;
      onUpdate({
        ...c,
        headerProps: {
          ...(c.headerProps ?? {}),
          height: top,
          paddingBottom: bottom,
        },
      });
    },
    300,
  );

  const startAdjusting = () => globalThis.document?.body.setAttribute(ATTR, "");
  const stopAdjusting = () => globalThis.document?.body.removeAttribute(ATTR);

  const handleTopSliderChange = (val: number) => {
    startAdjusting();
    setPaddingTop(val);
    const c = contentRef.current as BankContent;
    onUpdate({
      ...c,
      headerProps: { ...(c.headerProps ?? {}), height: val, paddingBottom },
    });
  };

  const handleBottomSliderChange = (val: number) => {
    startAdjusting();
    setPaddingBottom(val);
    const c = contentRef.current as BankContent;
    onUpdate({
      ...c,
      headerProps: {
        ...(c.headerProps ?? {}),
        height: paddingTop,
        paddingBottom: val,
      },
    });
  };

  const handleTopNumberChange = (val: number | string) => {
    const n = typeof val === "number" ? val : paddingTop;
    setPaddingTop(n);
    debouncedUpdate(n, paddingBottom);
  };

  const handleBottomNumberChange = (val: number | string) => {
    const n = typeof val === "number" ? val : paddingBottom;
    setPaddingBottom(n);
    debouncedUpdate(paddingTop, n);
  };

  return (
    <Stack gap="md" p="xs">
      <Stack gap={4}>
        <Text fz="xs" fw={500} c="dimmed">
          Top Padding
        </Text>
        <Group gap="xs" align="center">
          <Slider
            value={paddingTop}
            onChange={handleTopSliderChange}
            onChangeEnd={stopAdjusting}
            min={0}
            max={4}
            step={0.05}
            label={(v) => `${v.toFixed(2)}in`}
            disabled={disabled}
            style={{ flex: 1 }}
          />
          <NumberInput
            value={paddingTop}
            onChange={handleTopNumberChange}
            min={0}
            max={4}
            step={0.05}
            decimalScale={2}
            suffix="in"
            size="xs"
            disabled={disabled}
            styles={inputStyles}
            style={{ width: 64 }}
            hideControls
          />
        </Group>
      </Stack>

      <Stack gap={4}>
        <Text fz="xs" fw={500} c="dimmed">
          Bottom Padding
        </Text>
        <Group gap="xs" align="center">
          <Slider
            value={paddingBottom}
            onChange={handleBottomSliderChange}
            onChangeEnd={stopAdjusting}
            min={0}
            max={4}
            step={0.05}
            label={(v) => `${v.toFixed(2)}in`}
            disabled={disabled}
            style={{ flex: 1 }}
          />
          <NumberInput
            value={paddingBottom}
            onChange={handleBottomNumberChange}
            min={0}
            max={4}
            step={0.05}
            decimalScale={2}
            suffix="in"
            size="xs"
            disabled={disabled}
            styles={inputStyles}
            style={{ width: 64 }}
            hideControls
          />
        </Group>
      </Stack>
    </Stack>
  );
}
