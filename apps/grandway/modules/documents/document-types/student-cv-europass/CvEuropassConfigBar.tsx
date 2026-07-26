"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Stack,
  Group,
  Text,
  ColorSwatch,
  SegmentedControl,
} from "@peppermint/ui";
import { Check as CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import {
  DEFAULT_EUROPASS_APPEARANCE,
  EUROPASS_HEADER_SWATCHES,
  readableTextColor,
  type EuropassFontFamily,
} from "@/components/templates/student-cv-europass/appearance";
import type { DocumentConfigBarProps, CvContent } from "../../documents.types";

const PERSIST_DEBOUNCE_MS = 400;

export function CvEuropassConfigBar({
  document: doc,
  onUpdate,
  onPersist,
  disabled,
}: DocumentConfigBarProps) {
  const content = doc.content as CvContent;
  // Latest content / persist target, read at flush time (not during render).
  const contentRef = useRef(content);
  const onPersistRef = useRef(onPersist);
  // eslint-disable-next-line react-hooks/refs
  contentRef.current = content;
  // eslint-disable-next-line react-hooks/refs
  onPersistRef.current = onPersist;

  const appearance = {
    ...DEFAULT_EUROPASS_APPEARANCE,
    ...(content.appearance ?? {}),
  };
  const [headerColor, setHeaderColor] = useState(appearance.headerColor);
  const [fontFamily, setFontFamily] = useState<EuropassFontFamily>(
    appearance.fontFamily,
  );
  // The chosen appearance, read at flush time so the persist reflects the final choice.
  const appearanceRef = useRef({ headerColor, fontFamily });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist from the FRESHEST content + latest appearance — never a snapshot taken when
  // the swatch was clicked. Content saves wholesale, so merging the latest cache content
  // avoids a delayed appearance PATCH clobbering an intervening save.
  const persistNow = useCallback(() => {
    onPersistRef.current?.({
      ...(contentRef.current as CvContent),
      appearance: appearanceRef.current,
    });
  }, []);

  const schedulePersist = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      persistNow();
    }, PERSIST_DEBOUNCE_MS);
  }, [persistNow]);

  // Flush a pending change if the panel/instance unmounts (panel closed or active
  // document switched) inside the debounce window, so the save is never silently lost.
  // Cleanup runs before the next document's ConfigBar mounts and reads this instance's
  // own refs, so it always persists to the document that was being edited.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        persistNow();
      }
    };
  }, [persistNow]);

  const apply = (color: string, family: EuropassFontFamily) => {
    appearanceRef.current = { headerColor: color, fontFamily: family };
    onUpdate({
      ...(contentRef.current as CvContent),
      appearance: appearanceRef.current,
    }); // instant live preview (local cache)
    schedulePersist(); // persist to backend from the freshest content
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
