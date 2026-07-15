"use client";

import { useEffect, useRef, useState } from "react";
import {
  Anchor,
  Box,
  Button,
  Group,
  notifications,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@peppermint/ui";

import type { SignInPhase } from "./SignIn.types";
import classes from "./SignIn.module.css";

const notWired = (feature: string) =>
  notifications.show({
    color: "blue",
    title: "Not connected yet",
    message: `${feature} isn't wired to the backend in this build.`,
  });

export function ModuleSignIn() {
  const [phase, setPhase] = useState<SignInPhase>("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const introCtaRef = useRef<HTMLButtonElement>(null);
  const isFirstRender = useRef(true);

  // Return focus to the primary CTA when the user backs out of the email
  // step, so keyboard / screen-reader users aren't dropped onto <body>.
  // Skipped on first mount to avoid stealing focus on initial landing.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (phase === "intro") {
      introCtaRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    notWired("Email sign-in");
  };

  return (
    <Box component="main" className={classes.page}>
      <Stack className={classes.shell} align="center" gap={28}>
        <Group gap={9} justify="center">
          <Box className={classes.logoMark} />
          <Text component="span" className={classes.wordmark}>
            <Text component="span" fw={700} inherit>
              kam
            </Text>
            ban.
          </Text>
        </Group>

        <Box className={classes.hero}>
          <Text className={classes.heroLabel}>Onboarding artwork</Text>
        </Box>

        <Title order={1} className={classes.headline}>
          Built for you to plan smarter and work better.
        </Title>

        {phase === "email" ? (
          <form key="email" onSubmit={handleSubmit} className={classes.reveal}>
            <Stack gap="sm">
              <TextInput
                type="email"
                name="email"
                autoComplete="email"
                label="Email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                radius="md"
                autoFocus
                required
              />
              <PasswordInput
                name="password"
                autoComplete="current-password"
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                radius="md"
                required
              />
              <Button
                type="submit"
                radius={20}
                className={classes.cta}
                disabled={!email || !password}
              >
                Continue
              </Button>
              <Anchor
                component="button"
                type="button"
                className={classes.link}
                onClick={() => setPhase("intro")}
              >
                Use another method
              </Anchor>
            </Stack>
          </form>
        ) : (
          <Stack key="intro" className={classes.reveal} align="center" gap={20}>
            <Button
              ref={introCtaRef}
              radius={20}
              className={classes.cta}
              onClick={() => setPhase("email")}
            >
              Continue with email
            </Button>
            <Anchor
              component="button"
              type="button"
              className={classes.link}
              onClick={() => notWired("Magic email")}
            >
              Continue with magic email
            </Anchor>
            <Text className={classes.footer}>
              Griha helps you organize, manage, and complete your work&mdash;the
              right way.
            </Text>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
