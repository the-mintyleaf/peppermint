"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionIcon,
  Center,
  Container,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";
import { MoonIcon } from "@phosphor-icons/react/dist/csr/Moon";
import { SunIcon } from "@phosphor-icons/react/dist/csr/Sun";
import { hasAccessToken } from "@/lib/authTokens";
import { SignInPanel } from "./components/SignInPanel";
import type { SignInPhase } from "./components/SignInPanel";

/**
 * Bespoke sign-in screen: a single centred form card on the app background, using
 * the same field/button treatment as `@peppermint/admin`'s `SignInPage`
 * (`SignInLayoutDefault`/`SignInPanelContent`). Not built on that shared primitive: its
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
      <Container h="100vh" size="xs">
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
                      <span style={{ color: "var(--mantine-color-brand-5)" }}>
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
                  Grandway Education Pvt. Ltd. | If you are not supposed to be
                  here, go back
                </Text>
              </Center>
            </Stack>
          )}
        </Center>
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
