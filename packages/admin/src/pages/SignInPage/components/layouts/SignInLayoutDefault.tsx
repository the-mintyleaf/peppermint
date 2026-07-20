"use client";

import {
  Anchor,
  Center,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { LeafIcon } from "@phosphor-icons/react/dist/ssr";

import { SignInPanelContent } from "../SignInPanelContent";
import type { SignInLayoutProps } from "../../SignInPage.types";

/**
 * The original sign-in chrome: a brand-gradient (or image-backed) panel on the
 * left, a centred form card on the right.
 */
export function SignInLayoutDefault({ controller, page }: SignInLayoutProps) {
  const {
    heading = ["Sign into", "to your portal."],
    subheading = "Enter your credentials to access your account.",
    brand = ["Portal", "by Peppermint"],
    panelTagline = "Work done right.",
    panelHeading = "Sketched from the ground up to make the work work.",
    panelBackgroundImage,
  } = page;

  // Layered over the image, a flat 50%-black gradient halves its brightness so the
  // panel's light text stays readable regardless of the source image.
  const panelBackgroundStyle = panelBackgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${JSON.stringify(
          panelBackgroundImage,
        )})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  return (
    <Container h="100vh">
      <Grid>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              ...panelBackgroundStyle,
            }}
            px="4rem"
            py="5rem"
            bg={
              panelBackgroundImage
                ? undefined
                : "linear-gradient(120deg, var(--mantine-color-brand-9),var(--mantine-color-brand-7))"
            }
            h="calc(100vh - 2*var(--mantine-spacing-xl))"
            my="xl"
            radius="lg"
          >
            <Group gap={4}>
              <LeafIcon color="var(--mantine-color-gray-0)" weight="fill" />
              <Title size="md" c="gray.0">
                {brand[0]}{" "}
                <span style={{ color: "var(--mantine-color-brand-3)" }}>
                  {brand[1]}
                </span>
              </Title>
            </Group>

            <Stack style={{ fontFamily: "var(--font-special)" }}>
              <Text size="md" c="gray.0">
                {panelTagline}
              </Text>
              <Text size="4rem" c="gray.0">
                {panelHeading}
              </Text>
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Center h="calc(100vh - 2*var(--mantine-spacing-xl))">
            {controller.phase === "redirecting" ? (
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
                        {heading[0]}{" "}
                        <span style={{ color: "var(--mantine-color-brand-5)" }}>
                          {heading[1]}
                        </span>
                      </Title>
                      <Text c="dimmed" size="xs" ta="center" maw={400}>
                        {controller.phase === "mfa"
                          ? "Verify it's you to finish signing in."
                          : subheading}
                      </Text>
                    </Stack>

                    <SignInPanelContent controller={controller} page={page} />
                  </Stack>
                </Paper>

                <Center>
                  <Stack gap="xs">
                    <Text ta="center" size="10px" c="gray.0">
                      By signing in, you agree to our{" "}
                      <Anchor href="/terms" c="brand.4">
                        Terms of Service
                      </Anchor>{" "}
                      and{" "}
                      <Anchor href="/privacy" c="brand.4">
                        Privacy Policy
                      </Anchor>
                      .
                    </Text>

                    <Text ta="center" size="10px" c="gray.5">
                      Version v1.0.1 @ Copyright 2026 mintyleaf.co
                    </Text>
                  </Stack>
                </Center>
              </Stack>
            )}
          </Center>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
