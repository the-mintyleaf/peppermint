"use client";

import { Box, Group, Stack, Text, UnstyledButton } from "@peppermint/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { MonoText } from "@/components";
import { tokens } from "@/config/design";
import { departments } from "../../Onboarding.data";
import type { StepDetailsProps } from "../../Onboarding.types";

const caption = {
  fz: 11,
  c: tokens.muted,
} as const;

const inputStyle: React.CSSProperties = {
  height: 50,
  borderRadius: 13,
  border: "1px solid rgba(0, 0, 0, 0.12)",
  background: "rgba(10, 12, 14, 0.03)",
  padding: "0 15px",
  fontSize: 15,
  fontWeight: 500,
  width: "100%",
  outline: "none",
  color: tokens.ink,
};

export function StepDetails({
  fullName,
  onFullName,
  email,
  onEmail,
  dept,
  onDept,
}: StepDetailsProps) {
  return (
    <Stack gap={22}>
      <Stack gap={10}>
        <MonoText label {...caption} c={tokens.accent}>
          GET STARTED
        </MonoText>
        <Text
          fw={700}
          fz={27}
          style={{ letterSpacing: -1, lineHeight: 1.08, maxWidth: 290 }}
        >
          Tell us who you are.
        </Text>
        <Text fw={500} fz={14} c={tokens.muted}>
          We&rsquo;ll use this to personalise your workspace and assign tasks.
        </Text>
      </Stack>

      <Group gap={14} align="center" wrap="nowrap">
        <Box
          style={{
            position: "relative",
            width: 74,
            height: 74,
            flexShrink: 0,
          }}
        >
          <Box
            style={{
              width: 74,
              height: 74,
              borderRadius: "50%",
              background: "rgba(10, 12, 14, 0.06)",
              boxShadow: "inset 0 0 0 1px rgba(0, 0, 0, 0.08)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              right: -2,
              bottom: -2,
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: tokens.accent,
              border: `2px solid ${tokens.paper}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon size={12} weight="bold" color="#fff" aria-label="Add" />
          </Box>
        </Box>
        <Stack gap={2}>
          <Text fw={600} fz={14}>
            Add a photo
          </Text>
          <Text fw={500} fz={12} c={tokens.muted}>
            Optional — drop an image on the circle.
          </Text>
        </Stack>
      </Group>

      <Stack gap={18}>
        <Stack gap={7}>
          <MonoText label {...caption}>
            FULL NAME
          </MonoText>
          <input
            type="text"
            value={fullName}
            onChange={(event) => onFullName(event.currentTarget.value)}
            placeholder="Sudhan Gurung"
            aria-label="Full name"
            style={inputStyle}
          />
        </Stack>

        <Stack gap={7}>
          <MonoText label {...caption}>
            WORK EMAIL
          </MonoText>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmail(event.currentTarget.value)}
            placeholder="you@ministry.gov"
            aria-label="Work email"
            style={inputStyle}
          />
        </Stack>

        <Stack gap={9}>
          <MonoText label {...caption}>
            DEPARTMENT
          </MonoText>
          <Group gap={8}>
            {departments.map((option) => {
              const active = option === dept;
              return (
                <UnstyledButton
                  key={option}
                  onClick={() => onDept(option)}
                  aria-pressed={active}
                  style={{
                    height: 38,
                    padding: "0 15px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    border: `1px solid ${active ? tokens.accent : "rgba(0, 0, 0, 0.12)"}`,
                    background: active
                      ? "rgba(238, 87, 41, 0.08)"
                      : "transparent",
                    color: active ? "rgb(205, 66, 26)" : tokens.muted,
                  }}
                >
                  {option}
                </UnstyledButton>
              );
            })}
          </Group>
        </Stack>
      </Stack>
    </Stack>
  );
}
