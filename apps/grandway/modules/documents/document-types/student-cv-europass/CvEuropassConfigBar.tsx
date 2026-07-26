"use client";

import { useRef, useState } from "react";
import {
  Stack,
  Group,
  Text,
  ColorSwatch,
  SegmentedControl,
  useDebouncedCallback,
} from "@peppermint/ui";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import {
  DEFAULT_EUROPASS_APPEARANCE,
  EUROPASS_HEADER_SWATCHES,
  readableTextColor,
  type EuropassFontFamily,
} from "@/components/templates/student-cv-europass/appearance";
import type { DocumentConfigBarProps, CvContent } from "../../documents.types";

export function CvEuropassConfigBar({
  document: doc,
  onUpdate,
  onPersist,
  disabled,
}: DocumentConfigBarProps) {
  const content = doc.content as CvContent;
  // Latest-content ref read by the debounced persist (not during render).
  const contentRef = useRef(content);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;

  const appearance = {
    ...DEFAULT_EUROPASS_APPEARANCE,
    ...(content.appearance ?? {}),
  };
  const [headerColor, setHeaderColor] = useState(appearance.headerColor);
  const [fontFamily, setFontFamily] = useState<EuropassFontFamily>(
    appearance.fontFamily,
  );

  const debouncedPersist = useDebouncedCallback((next: CvContent) => {
    onPersist?.(next);
  }, 400);

  const apply = (color: string, family: EuropassFontFamily) => {
    const next: CvContent = {
      ...(contentRef.current as CvContent),
      appearance: { headerColor: color, fontFamily: family },
    };
    onUpdate(next); // instant live preview (local cache)
    debouncedPersist(next); // persist to backend
  };

  const handleColor = (color: string) => {
    setHeaderColor(color);
    apply(color, fontFamily);
  };

  const handleFamily = (value: string) => {
    const family = value === "serif" ? "serif" : "sans";
    setFontFamily(family);
    apply(headerColor, family);
  };

  return (
    <Stack gap="md" p="xs">
      <Stack gap={6}>
        <Text fz="xs" fw={500} c="dimmed">
          Header color
        </Text>
        <Group gap="xs">
          {EUROPASS_HEADER_SWATCHES.map((swatch) => {
            const selected = swatch.value === headerColor;
            return (
              <ColorSwatch
                key={swatch.value}
                component="button"
                type="button"
                color={swatch.value}
                onClick={() => !disabled && handleColor(swatch.value)}
                aria-label={swatch.label}
                aria-pressed={selected}
                title={swatch.label}
                style={{
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: readableTextColor(swatch.value),
                  outline: selected
                    ? "2px solid var(--mantine-color-brand-6)"
                    : "none",
                  outlineOffset: 2,
                }}
              >
                {selected && <CheckIcon size={14} aria-hidden />}
              </ColorSwatch>
            );
          })}
        </Group>
      </Stack>

      <Stack gap={6}>
        <Text fz="xs" fw={500} c="dimmed">
          Font
        </Text>
        <SegmentedControl
          size="xs"
          fullWidth
          value={fontFamily}
          onChange={handleFamily}
          disabled={disabled}
          data={[
            { label: "Sans", value: "sans" },
            { label: "Serif", value: "serif" },
          ]}
        />
      </Stack>
    </Stack>
  );
}
