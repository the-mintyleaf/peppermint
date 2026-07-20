"use client";

import { LeafIcon, LockKeyIcon } from "@phosphor-icons/react/dist/ssr";

import {
  Anchor,
  Center,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";

import { PasswordChangePanelContent } from "../PasswordChangePanelContent";
import { headingForPhase } from "../../utils/resolvePasswordChangePageProps";
import type { PasswordChangeLayoutProps } from "../../PasswordChangePage.types";

/**
 * The default chrome, matching `SignInLayoutDefault`: a brand-gradient (or
 * image-backed) panel on the left, a centred form card on the right.
 */
export function PasswordChangeLayoutDefault({
  controller,
  page,
}: PasswordChangeLayoutProps) {
  const {
    heading,
    subheading,
    brand,
    panelTagline,
    panelHeading,
    panelBackgroundImage,
  } = page;

  const pageHeading = headingForPhase(heading, controller.phase);

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
            <Stack>
              <Paper
                bg="none"
                w={{ base: "100%", sm: 440 }}
                p={{ base: "md", lg: "3rem" }}
              >
                <Stack gap="md" w="100%">
                  <Stack gap="xs" align="center">
                    <Center mb={4}>
                      <LockKeyIcon
                        size={36}
                        color="var(--mantine-color-brand-5)"
                        weight="duotone"
                        aria-hidden
                      />
                    </Center>

                    <Title size="2rem" order={1} ta="center" fw={500} lh="100%">
                      {pageHeading[0]}{" "}
                      <span style={{ color: "var(--mantine-color-brand-5)" }}>
                        {pageHeading[1]}
                      </span>
                    </Title>

                    {controller.phase === "form" && (
                      <Text c="dimmed" size="xs" ta="center" maw={360}>
                        {subheading}
                      </Text>
                    )}
                  </Stack>

                  <PasswordChangePanelContent
                    controller={controller}
                    page={page}
                  />
                </Stack>
              </Paper>

              <Center>
                <Stack gap="xs">
                  <Text ta="center" size="10px">
                    By continuing, you agree to our{" "}
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
          </Center>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
