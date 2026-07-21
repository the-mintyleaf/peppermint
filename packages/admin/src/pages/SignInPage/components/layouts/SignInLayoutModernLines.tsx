"use client";

import { LeafIcon } from "@phosphor-icons/react/dist/ssr";

import { Anchor, Box, Group, Loader, Stack, Text, Title } from "@peppermint/ui";

import { SignInPanelContent } from "../SignInPanelContent";
import type { SignInLayoutProps, SignInPhase } from "../../SignInPage.types";
import classes from "./SignInLayoutModernLines.module.css";

/** Step counter shown in the brand column and the bottom status rail. */
const STEP_META: Record<SignInPhase, string> = {
  credentials: "01/02 — Credentials",
  mfa: "02/02 — Verification",
  redirecting: "02/02 — Signed in",
};

/**
 * The "modern lines" chrome: a single bordered frame divided into a top rail, a
 * split body and a status rail, with every region delimited by a 1px rule.
 * Colours come from theme tokens, so it follows the host app's light/dark mode.
 */
export function SignInLayoutModernLines({
  controller,
  page,
}: SignInLayoutProps) {
  const {
    heading,
    subheading,
    brand,
    panelTagline,
    panelHeading,
    panelBackgroundImage,
  } = page;

  const isRedirecting = controller.phase === "redirecting";

  // Over an image the brand column needs light ink; on the plain frame it follows
  // the theme's own text colour so both schemes stay legible.
  const brandInk = panelBackgroundImage ? "gray.0" : undefined;
  const brandInkDimmed = panelBackgroundImage ? "gray.4" : "dimmed";

  // The same 50%-black overlay the default layout uses, so a supplied image can
  // never wash out the text on top of it.
  const brandColStyle = panelBackgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${JSON.stringify(
          panelBackgroundImage,
        )})`,
      }
    : undefined;

  return (
    <Box className={classes.root}>
      <Box className={classes.frame}>
        <Box component="header" className={classes.topRail}>
          <Group gap={6}>
            <LeafIcon weight="fill" aria-hidden />
            <Text fw={600} size="sm">
              {brand[0]}{" "}
              <Text span c="dimmed" inherit>
                {brand[1]}
              </Text>
            </Text>
          </Group>

          <Text
            className={`${classes.meta} ${classes.topRailMeta}`}
            size="10px"
            c="dimmed"
          >
            Secure access
          </Text>
        </Box>

        <Box className={classes.body}>
          <Box
            bg="var(--mantine-color-brand-light)"
            component="section"
            className={`${classes.brandCol} ${
              panelBackgroundImage ? classes.brandColImage : ""
            }`}
            style={brandColStyle}
          >
            <Text
              className={classes.meta}
              fw={800}
              size="10px"
              c={brandInkDimmed}
            >
              {panelTagline}
            </Text>

            <Title
              order={1}
              fw={500}
              lh={1.05}
              size="clamp(2rem, 5vw, 3rem)"
              c={brandInk}
            >
              {panelHeading}
            </Title>
          </Box>

          <Box component="section" className={classes.formCol}>
            <Box className={classes.formFrame}>
              <Box className={classes.formFrameInner}>
                {isRedirecting ? (
                  <Stack gap="sm" align="center" py="xl">
                    <Loader type="dots" size="sm" color="brand.5" />
                    <Title order={2} size="1.75rem" fw={500} ta="center">
                      Welcome{" "}
                      <Text span inherit c="brand.5">
                        back!
                      </Text>
                    </Title>
                    <Text c="dimmed" size="sm" ta="center" maw={320}>
                      Give me a moment while I get you in…
                    </Text>
                  </Stack>
                ) : (
                  <Stack gap="md">
                    <Stack gap={"xl"}>
                      <Text
                        fw={800}
                        className={classes.meta}
                        size="10px"
                        c="dimmed"
                      >
                        {controller.phase === "mfa"
                          ? "Two-factor"
                          : "Authenticate"}
                      </Text>

                      <Title order={2} size="1.75rem" fw={500} lh={1.1}>
                        {heading[0]}{" "}
                        <Text span inherit c="brand.5">
                          {heading[1]}
                        </Text>
                      </Title>

                      <Text c="dimmed" size="xs">
                        {controller.phase === "mfa"
                          ? "Verify it's you to finish signing in."
                          : subheading}
                      </Text>
                    </Stack>

                    <SignInPanelContent controller={controller} page={page} />
                  </Stack>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box py="lg" component="footer" className={classes.statusRail}>
          <Text className={classes.meta} size="10px" c="dimmed">
            {STEP_META[controller.phase]}
          </Text>

          <Text size="10px" c="dimmed" ta="center">
            By signing in, you agree to our{" "}
            <Anchor href="/terms" size="10px" c="brand.5">
              Terms of Service
            </Anchor>{" "}
            and{" "}
            <Anchor href="/privacy" size="10px" c="brand.5">
              Privacy Policy
            </Anchor>
            .
          </Text>

          <Text className={classes.meta} size="10px" c="dimmed">
            v1.0.1
          </Text>
        </Box>

        <Box className={classes.checker} aria-hidden />
      </Box>
    </Box>
  );
}
