"use client";

import { useRouter } from "next/navigation";

import { CaretUpDownIcon } from "@phosphor-icons/react/dist/csr/CaretUpDown";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { Box, Group, Text, UnstyledButton } from "@peppermint/ui";

import { tokens } from "@/config/design";

/**
 * Home top bar: brand mark, org pill, the Ask-AI magnifier entry, and the
 * account avatar placeholder. The magnifier routes to the AI screen.
 */
export function HomeHeader() {
  const router = useRouter();

  return (
    <Group gap={10} align="center" wrap="nowrap">
      <Box
        aria-hidden
        style={{
          width: 12,
          height: 12,
          flex: "0 0 auto",
          borderRadius: 3,
          border: `1.5px solid ${tokens.ink}`,
        }}
      />

      <Text fz="15px" fw={500} style={{ letterSpacing: "-0.3px" }}>
        <span style={{ fontWeight: 700 }}>kam</span>ban.
      </Text>

      <Group
        gap={4}
        align="center"
        wrap="nowrap"
        style={{
          height: 28,
          borderRadius: 20,
          paddingInline: 13,
          background: "rgba(0,0,0,0.05)",
        }}
      >
        <Text fz="11px" fw={500} c={tokens.muted}>
          Ministry
        </Text>
        <CaretUpDownIcon size={12} color={tokens.muted} aria-hidden />
      </Group>

      <UnstyledButton
        onClick={() => router.push("/ai")}
        aria-label="Ask AI"
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 34,
          height: 34,
          borderRadius: "50%",
        }}
      >
        <MagnifyingGlassIcon size={20} color={tokens.ink} />
      </UnstyledButton>

      <Box
        aria-hidden
        style={{
          width: 30,
          height: 30,
          flex: "0 0 auto",
          borderRadius: "50%",
          background: "rgba(0,0,0,0.1)",
        }}
      />
    </Group>
  );
}
