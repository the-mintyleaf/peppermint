"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun";
import { hasAccessToken } from "@/lib/authTokens";
import { SignInPanel } from "./components/SignInPanel";
import type { SignInPhase } from "./components/SignInPanel";

/**
 * Bespoke sign-in screen, styled to match `@peppermint/admin`'s `SignInPage`
 * (`SignInLayoutDefault`/`SignInPanelContent`) — branded gradient panel + centred
 * form card, same field/button treatment. Not built on that shared primitive: its
 * MFA model (`mfa_required` + `challenge_id` + a separate `mfaVerifyApi`) and login
 * payload (identifier + password only) don't fit Grandway's contract (required
 * `device_id`, same-endpoint MFA retry via `otp_code`, a device-limit dialog) — see
 * `docs/AI.md` for the full rationale. This mirrors that design by hand instead.
 */
export function ModuleSignIn() {
  const router = useRouter();
  const [phase, setPhase] = useState<SignInPhase>("credentials");
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  useEffect(() => {
    if (hasAccessToken()) {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <>
      <Container h="100vh">
        <Grid>
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Paper
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                backgroundSize: "cover",
              }}
              px="4rem"
              py="5rem"
              bg="url(https://images.pexels.com/photos/37930273/pexels-photo-37930273.jpeg)"
              h="calc(100vh - 2*var(--mantine-spacing-xl))"
              my="xl"
              radius="lg"
            >
              <Group gap={4}>
                <IdentificationCardIcon
                  color="var(--mantine-color-gray-0)"
                  weight="fill"
                  aria-hidden
                />
                <Title size="md" c="gray.0">
                  Grandway
                </Title>
              </Group>

              <Stack style={{ fontFamily: "var(--font-special)" }}>
                <Text size="md" c="gray.0">
                  Grandway Education
                </Text>
                <Text size="4rem" c="gray.0">
                  Management Portal.
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Center h="calc(100vh - 2*var(--mantine-spacing-xl))">
              {phase === "redirecting" ? (
                <Stack gap="sm" align="center" p="md">
                  <Loader type="dots" size="sm" color="brand.5" />
                  <Title
                    c="gray.0"
                    size="2rem"
                    order={2}
                    ta="center"
                    fw={500}
                    lh="100%"
                  >
                    Welcome{" "}
                    <span style={{ color: "var(--mantine-color-brand-5)" }}>
                      back!
                    </span>
                  </Title>
                  <Text c="dimmed" size="sm" ta="center" maw={320}>
                    Give me a moment while I get you in…
                  </Text>
                </Stack>
              ) : (
                <Stack>
                  <Paper
                    bg="none"
                    w={{ base: "100%", sm: 440 }}
                    p={{ base: "md", lg: "3rem" }}
                  >
                    <Stack gap="md" w="100%">
                      <Stack gap="xs" align="center">
                        <Title
                          c="gray.0"
                          size="2rem"
                          order={2}
                          ta="center"
                          fw={500}
                          lh="100%"
                        >
                          {phase === "mfa" ? "Verify it's" : "Sign into"}{" "}
                          <span
                            style={{ color: "var(--mantine-color-brand-5)" }}
                          >
                            {phase === "mfa" ? "you" : "Grandway."}
                          </span>
                        </Title>
                        <Text c="dimmed" size="xs" ta="center" maw={400}>
                          {phase === "mfa"
                            ? "Finish signing in with your authenticator app."
                            : "Don't have an account? Ask your administrator to create one."}
                        </Text>
                      </Stack>

                      <SignInPanel phase={phase} onPhaseChange={setPhase} />
                    </Stack>
                  </Paper>

                  <Center>
                    <Text ta="center" size="10px" c="gray.5">
                      Grandway
                    </Text>
                  </Center>
                </Stack>
              )}
            </Center>
          </Grid.Col>
        </Grid>
      </Container>

      <Tooltip label={isDark ? "Light mode" : "Dark mode"} withArrow>
        <ActionIcon
          variant="default"
          size="lg"
          radius="xl"
          pos="fixed"
          bottom="1.25rem"
          right="1.25rem"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={() => setColorScheme(isDark ? "light" : "dark")}
        >
          {isDark ? (
            <SunIcon size={18} aria-hidden />
          ) : (
            <MoonIcon size={18} aria-hidden />
          )}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
