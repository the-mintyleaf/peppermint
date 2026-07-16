"use client";

import { Stack, Text } from "@peppermint/ui";

import type { BilingualNameProps } from "./BilingualName.types";

/**
 * Renders a bilingual organization/position name: `np` (Devanagari) as the
 * canonical primary label, with `en` (English) as a muted secondary line when
 * present and distinct. Never renders `*_romanized` — that field is a
 * backend-only search key.
 */
export function BilingualName({
  np,
  en,
  size = "sm",
  fw = 500,
  c,
  inline = false,
}: BilingualNameProps) {
  const showEn = Boolean(en && en.trim() && en !== np);

  if (inline) {
    return (
      <Text size={size} fw={fw} c={c} span>
        {np}
        {showEn && (
          <Text size="xs" c="dimmed" span ml={4}>
            · {en}
          </Text>
        )}
      </Text>
    );
  }

  return (
    <Stack gap={0}>
      <Text size={size} fw={fw} c={c}>
        {np}
      </Text>
      {showEn && (
        <Text size="xs" c="dimmed">
          {en}
        </Text>
      )}
    </Stack>
  );
}
