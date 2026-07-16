"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { fontDefs, sizeDefs, themeDefs } from "../../Onboarding.data";
import type { StepPreferencesProps } from "../../Onboarding.types";

const caption = {
  fz: 11,
  c: tokens.muted,
} as const;

export function StepPreferences({
  theme,
  onTheme,
  font,
  onFont,
  sizeIdx,
  onSizeIdx,
}: StepPreferencesProps) {
  const activeSize = sizeDefs[sizeIdx] ?? sizeDefs[1];

  return (
    <Stack gap={24}>
      <Stack gap={10}>
        <MonoText label {...caption} c={tokens.blueInk}>
          MAKE IT YOURS
        </MonoText>
        <Text fw={700} fz={27} style={{ letterSpacing: -1, lineHeight: 1.08 }}>
          Set your preferences.
        </Text>
      </Stack>

      {/* THEME */}
      <Stack gap={10}>
        <MonoText label {...caption}>
          THEME
        </MonoText>
        <Group gap={10} grow>
          {themeDefs.map((option) => {
            const active = option.key === theme;
            return (
              <UnstyledButton
                key={option.key}
                onClick={() => onTheme(option.key)}
                aria-pressed={active}
                style={{
                  padding: 10,
                  borderRadius: 14,
                  border: `1.5px solid ${active ? tokens.accent : "rgba(0, 0, 0, 0.12)"}`,
                  background: active
                    ? "rgba(238, 87, 41, 0.06)"
                    : "transparent",
                }}
              >
                <Stack gap={9} align="stretch">
                  <Box
                    style={{
                      height: 38,
                      borderRadius: 9,
                      background: option.swatch,
                      boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
                    }}
                  />
                  <Text
                    fw={600}
                    fz={13}
                    ta="center"
                    c={active ? "rgb(205, 66, 26)" : tokens.ink}
                  >
                    {option.label}
                  </Text>
                </Stack>
              </UnstyledButton>
            );
          })}
        </Group>
      </Stack>

      {/* TYPEFACE */}
      <Stack gap={10}>
        <MonoText label {...caption}>
          TYPEFACE
        </MonoText>
        <Stack gap={9}>
          {fontDefs.map((option) => {
            const active = option.key === font;
            return (
              <UnstyledButton
                key={option.key}
                onClick={() => onFont(option.key)}
                aria-pressed={active}
                style={{
                  padding: "12px 14px",
                  borderRadius: 14,
                  border: `1.5px solid ${active ? tokens.accent : "rgba(0, 0, 0, 0.12)"}`,
                  background: active
                    ? "rgba(238, 87, 41, 0.05)"
                    : "transparent",
                }}
              >
                <Group gap={13} align="center" wrap="nowrap">
                  <Text
                    fw={600}
                    fz={22}
                    style={{ fontFamily: option.stack, lineHeight: 1 }}
                  >
                    Ag
                  </Text>
                  <Stack gap={1} style={{ flex: 1 }}>
                    <Text fw={600} fz={14}>
                      {option.name}
                    </Text>
                    <Text fw={500} fz={12} c={tokens.muted}>
                      {option.note}
                    </Text>
                  </Stack>
                  <Box
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: `2px solid ${active ? tokens.accent : "rgba(0, 0, 0, 0.2)"}`,
                      background: active ? tokens.accent : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {active ? (
                      <CheckIcon size={11} weight="bold" color="#fff" />
                    ) : null}
                  </Box>
                </Group>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Stack>

      {/* TEXT SIZE */}
      <Stack gap={10}>
        <Group justify="space-between" align="center">
          <MonoText label {...caption}>
            TEXT SIZE
          </MonoText>
          <MonoText fz={11} c={tokens.accent} style={{ fontWeight: 600 }}>
            {activeSize.label}
          </MonoText>
        </Group>
        <Group gap={12} align="center" wrap="nowrap">
          <Text fw={600} fz={13} c={tokens.muted}>
            A
          </Text>
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={sizeIdx}
            onChange={(event) => onSizeIdx(Number(event.currentTarget.value))}
            aria-label="Text size"
            style={{ flex: 1, accentColor: tokens.accent }}
          />
          <Text fw={600} fz={20} c={tokens.muted}>
            A
          </Text>
        </Group>
        <Box
          style={{
            background: "rgba(10, 12, 14, 0.035)",
            border: `1px solid ${tokens.line}`,
            borderRadius: 14,
            padding: 16,
          }}
        >
          <Text fw={500} fz={activeSize.px} style={{ lineHeight: 1.4 }}>
            Draft response to media queries on budget allocation.
          </Text>
        </Box>
      </Stack>
    </Stack>
  );
}
