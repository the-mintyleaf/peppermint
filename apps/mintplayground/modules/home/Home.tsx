"use client";

import {
  Box,
  Button,
  Divider,
  Group,
  ModalPaper,
  ModuleHeader,
  ScrollArea,
  Stack,
  Text,
  Title,
  useDisclosure,
} from "@peppermint/ui";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";

import { tokens } from "@/config/design";
import { AccountModal, SectionLabel } from "@/components";
import { MOCK_CREDENTIAL_HINTS, MOCK_PASSWORD } from "@/lib/mock/accounts";
import { useCurrentUser } from "@/modules/auth/_shared/useCurrentUser";
import { CapabilityGrid, SessionPanel } from "./components";
import type { CapabilityItem } from "./Home.types";

/** What exists today, and what is only a nav entry waiting for a route. */
const CAPABILITIES: CapabilityItem[] = [
  {
    id: "auth",
    label: "Auth flow",
    detail:
      "Sign-in, MFA challenge, forced password change and own-password change — all against in-app mock route handlers.",
    status: "ready",
  },
  {
    id: "shell",
    label: "App shell",
    detail:
      "Collapsible sidebar, spotlight search, user menu and the role-filtered nav, carried over intact.",
    status: "ready",
  },
  {
    id: "theme",
    label: "Theme & tokens",
    detail:
      "The full Mantine theme and the fixed design tokens — accent ramp, paper/ink surfaces, radii, shadows.",
    status: "ready",
  },
  {
    id: "sandbox",
    label: "Sandbox routes",
    detail:
      "Components, Design tokens, Scratch and Staff only are nav entries with no page behind them yet.",
    status: "placeholder",
  },
];

/**
 * The playground's landing page. It answers one question — "what is wired up in
 * here, and who am I signed in as?" — so the first thing you see after sign-in
 * tells you what you can build on rather than being decorative filler.
 */
export function ModuleHome() {
  const { user } = useCurrentUser();
  const [accountOpened, accountHandlers] = useDisclosure();

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[{ label: "Home", href: "/home" }]}
        right={
          <Group gap="xs" mr="sm">
            <Button
              size="xs"
              variant="light"
              leftSection={<KeyIcon size={16} aria-label="Change password" />}
              onClick={accountHandlers.open}
            >
              Change password
            </Button>
          </Group>
        }
      />

      <ModalPaper withBorder>
        <ScrollArea h="100%">
          <Stack gap={0}>
            {/* Page anchor — the one heading everything else sits under. */}
            <Stack gap={6} px="lg" pt="lg" pb="md">
              <Title order={1} c={tokens.ink}>
                {user ? `Hello, ${user.display_name}.` : "Hello."}
              </Title>
              <Text fz="13px" c={tokens.muted2} maw={620}>
                This is a sandbox for frontend and UI/UX work — the auth pages,
                the app shell and the theme from mintflow, with every request
                served by mock handlers inside this app. Nothing here talks to a
                server, so break things freely.
              </Text>
            </Stack>

            <Divider color={tokens.line} />

            <Box px="lg" py="md">
              <Stack gap="sm">
                <SectionLabel>What&rsquo;s wired up</SectionLabel>
                <CapabilityGrid items={CAPABILITIES} />
              </Stack>
            </Box>

            <Divider color={tokens.line} />

            <Box
              px="lg"
              py="md"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: 28,
              }}
            >
              {/* The session panel needs a user; the shell guarantees one by the
                  time this renders, so a missing user is a genuine fault, not a
                  loading state — say so rather than showing an empty card. */}
              {user ? (
                <SessionPanel user={user} />
              ) : (
                <Text fz="12px" c={tokens.muted}>
                  Session details are unavailable.
                </Text>
              )}

              <Stack gap="sm">
                <SectionLabel>Mock accounts</SectionLabel>
                <Stack gap={8}>
                  {MOCK_CREDENTIAL_HINTS.map(({ username, note }) => (
                    <Group key={username} justify="space-between" gap="lg">
                      <Text fz="12px" fw={600} ff={tokens.mono} c={tokens.ink}>
                        {username}
                      </Text>
                      <Text fz="12px" c={tokens.muted2} ta="right">
                        {note}
                      </Text>
                    </Group>
                  ))}
                </Stack>
                <Text fz="11px" c={tokens.muted}>
                  Password for every account:{" "}
                  <Text span inherit ff={tokens.mono}>
                    {MOCK_PASSWORD}
                  </Text>
                  . Changes last until the dev server restarts.
                </Text>
              </Stack>
            </Box>
          </Stack>
        </ScrollArea>
      </ModalPaper>

      <AccountModal opened={accountOpened} onClose={accountHandlers.close} />
    </>
  );
}
