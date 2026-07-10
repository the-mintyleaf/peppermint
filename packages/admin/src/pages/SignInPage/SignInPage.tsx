"use client";

import {
  ActionIcon,
  Alert,
  Anchor,
  Button,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@peppermint/ui";

import { useState } from "react";
import { GoogleIcon } from "./components/GoogleIcon";
import { SignInForm } from "./components/SignInForm";
import { MfaChallengeForm } from "./components/MfaChallengeForm";
import type {
  SignInIdentifierField,
  SignInPageProps,
} from "./SignInPage.types";
import { AUTH_TOKEN_KEYS } from "./utils/authTokenKeys";
import { decodeJWT } from "./utils/decodeJWT";
import { unwrapEnvelope } from "./utils/unwrapEnvelope";
import {
  AppleLogoIcon,
  DiscordLogoIcon,
  LeafIcon,
  MoonIcon,
  SunIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr";

type SignInPhase = "credentials" | "mfa" | "redirecting";

export function SignInPage({
  heading = ["Sign into", "to your portal."],
  subheading = "Enter your credentials to access your account.",
  brand = ["Portal", "by Peppermint"],
  panelTagline = "Work done right.",
  panelHeading = "Sketched from the ground up to make the work work.",
  icon,
  loginApi,
  identifierField,
  skipEmailValidation = false,
  successRedirectUrl,
  forgotRedirectUrl,
  onSuccess,
  onError,
  onForgotPassword,
  hasGoogleLogin = false,
  hasAppleLogin = false,
  hasDiscordLogin = false,
  hasMagicLinkLogin = false,
  onGoogleLogin,
  onAppleLogin,
  onDiscordLogin,
  onMagicLinkLogin,
  disableSignUp = false,
  disableForgotPassword = false,
  mfaVerifyApi,
  meApi,
  onMfaSetupRecommended,
  errorMessageMap,
}: SignInPageProps) {
  const resolvedIdentifierField: SignInIdentifierField =
    identifierField ?? (skipEmailValidation ? "username" : "email");

  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<SignInPhase>("credentials");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  const resolveErrorMessage = (data: any): string => {
    const code = data?.error?.code;
    if (code && errorMessageMap?.[code]) return errorMessageMap[code];
    return (
      data?.error?.message ??
      data?.message ??
      "Something went wrong. Please try again."
    );
  };

  const completeSuccess = async (data: any) => {
    setPhase("redirecting");

    const accessToken = data?.access || data?.accessToken;
    const refreshToken = data?.refresh || data?.refreshToken;

    if (accessToken) {
      sessionStorage.setItem(AUTH_TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem("access_token", accessToken);

      const decoded = decodeJWT(accessToken);
      if (decoded) {
        localStorage.setItem("token_payload", JSON.stringify(decoded));
      }
    }

    if (refreshToken) {
      sessionStorage.setItem(AUTH_TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem("refresh_token", refreshToken);
    }

    onSuccess?.(data);

    if (data?.mfa_setup_recommended) {
      onMfaSetupRecommended?.();
    }

    if (meApi && accessToken) {
      try {
        const userResponse = await fetch(meApi, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
      }
    }

    setTimeout(() => {
      window.location.href = successRedirectUrl;
    }, 1000);
  };

  const handleSignIn = async (identifier: string, password: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(loginApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [resolvedIdentifierField]: identifier,
          password,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(resolveErrorMessage(body));
        onError?.(body);
        return;
      }

      // Success payloads are wrapped in a `{ success, data }` envelope; unwrap
      // to reach access/refresh/mfa fields. Falls back to the raw body for
      // APIs that respond flat.
      const data = unwrapEnvelope(body);

      if (data?.mfa_required) {
        if (!mfaVerifyApi) {
          setErrorMessage(
            "Multi-factor authentication is required but not configured.",
          );
          onError?.(data);
          return;
        }
        setChallengeId(data.challenge_id ?? null);
        setPhase("mfa");
        return;
      }

      await completeSuccess(data);
    } catch (error: unknown) {
      setErrorMessage("Something went wrong. Please try again.");
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (code: string) => {
    if (!mfaVerifyApi) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(mfaVerifyApi, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challengeId, code }),
      });

      const body = await response.json();

      if (!response.ok) {
        setErrorMessage(resolveErrorMessage(body));
        onError?.(body);
        return;
      }

      await completeSuccess(unwrapEnvelope(body));
    } catch (error: unknown) {
      setErrorMessage("Something went wrong. Please try again.");
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    setPhase("credentials");
    setChallengeId(null);
    setErrorMessage(null);
  };

  const handleSocialLogin = (
    provider: "google" | "apple" | "discord",
    callback?: () => void,
  ) => {
    callback?.();
  };

  const handleMagicLinkSubmit = async (): Promise<void> => {
    if (!magicLinkEmail.trim()) {
      return;
    }

    try {
      await Promise.resolve(onMagicLinkLogin?.(magicLinkEmail));
      setMagicLinkEmail("");
    } catch (error: unknown) {
      console.error("Magic link error:", error);
    }
  };

  const socialProviders = [
    hasGoogleLogin,
    hasAppleLogin,
    hasDiscordLogin,
    hasMagicLinkLogin,
  ].filter(Boolean).length;

  const hasAnySocial = socialProviders > 0;

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
              }}
              px="4rem"
              py="5rem"
              bg="linear-gradient(120deg, var(--mantine-color-brand-9),var(--mantine-color-brand-7))"
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
                          {heading[0]}{" "}
                          <span
                            style={{ color: "var(--mantine-color-brand-5)" }}
                          >
                            {heading[1]}
                          </span>
                        </Title>
                        <Text c="dimmed" size="xs" ta="center" maw={400}>
                          {phase === "mfa"
                            ? "Verify it's you to finish signing in."
                            : subheading}
                        </Text>
                      </Stack>

                      <Stack gap="xs" py="md">
                        {errorMessage && (
                          <Alert
                            color="red"
                            icon={
                              <WarningIcon
                                size={18}
                                weight="fill"
                                aria-hidden
                              />
                            }
                          >
                            {errorMessage}
                          </Alert>
                        )}

                        {phase === "mfa" ? (
                          <MfaChallengeForm
                            onSubmit={handleMfaSubmit}
                            isLoading={isLoading}
                            onBackToSignIn={handleBackToSignIn}
                          />
                        ) : !showMagicLink ? (
                          <>
                            <SignInForm
                              onSubmit={handleSignIn}
                              isLoading={isLoading}
                              onForgotPassword={onForgotPassword}
                              identifierField={resolvedIdentifierField}
                              disableSignUp={disableSignUp}
                              disableForgotPassword={disableForgotPassword}
                            />

                            {hasAnySocial && (
                              <>
                                <Divider
                                  color="rgba(255,255,255,.1)"
                                  label="or sign in with"
                                  labelPosition="center"
                                  my="xs"
                                />

                                <SimpleGrid
                                  cols={Math.min(socialProviders, 3)}
                                  spacing="xs"
                                >
                                  {hasGoogleLogin && (
                                    <Button
                                      variant="default"
                                      size="md"
                                      leftSection={<GoogleIcon />}
                                      onClick={() =>
                                        handleSocialLogin(
                                          "google",
                                          onGoogleLogin,
                                        )
                                      }
                                      fullWidth
                                      styles={{
                                        inner: { justifyContent: "center" },
                                        label: { fontWeight: 600 },
                                      }}
                                    >
                                      Google
                                    </Button>
                                  )}
                                  {hasAppleLogin && (
                                    <Button
                                      variant="default"
                                      size="md"
                                      leftSection={
                                        <AppleLogoIcon
                                          weight="fill"
                                          size={20}
                                        />
                                      }
                                      onClick={() =>
                                        handleSocialLogin("apple", onAppleLogin)
                                      }
                                      fullWidth
                                    >
                                      Apple
                                    </Button>
                                  )}
                                  {hasDiscordLogin && (
                                    <Button
                                      variant="default"
                                      size="md"
                                      leftSection={
                                        <DiscordLogoIcon
                                          color="var(--mantine-color-indigo-6)"
                                          weight="fill"
                                          size={20}
                                        />
                                      }
                                      onClick={() =>
                                        handleSocialLogin(
                                          "discord",
                                          onDiscordLogin,
                                        )
                                      }
                                      fullWidth
                                    >
                                      Discord
                                    </Button>
                                  )}
                                  {hasMagicLinkLogin && (
                                    <Button
                                      variant="light"
                                      size="md"
                                      h={50}
                                      onClick={() => setShowMagicLink(true)}
                                      fullWidth
                                    >
                                      Magic Link
                                    </Button>
                                  )}
                                </SimpleGrid>
                              </>
                            )}
                          </>
                        ) : (
                          <Stack gap="md">
                            <Stack gap={0} mb="xs">
                              <Text fw={600} size="lg" ta="center">
                                Magic Link
                              </Text>
                              <Text c="dimmed" size="sm" ta="center">
                                We'll email you a link to sign in instantly.
                              </Text>
                            </Stack>

                            <TextInput
                              size="md"
                              label="Email"
                              placeholder="name@example.com"
                              type="email"
                              required
                              value={magicLinkEmail}
                              onChange={(e) =>
                                setMagicLinkEmail(e.currentTarget.value)
                              }
                            />

                            <Button
                              size="md"
                              color="black"
                              onClick={handleMagicLinkSubmit}
                              disabled={!magicLinkEmail.trim()}
                              fullWidth
                              h={50}
                            >
                              Send Magic Link
                            </Button>

                            <Button
                              variant="subtle"
                              size="sm"
                              c="dimmed"
                              onClick={() => {
                                setShowMagicLink(false);
                                setMagicLinkEmail("");
                              }}
                              fullWidth
                            >
                              Back to Sign In
                            </Button>
                          </Stack>
                        )}
                      </Stack>
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
                        Versoin v1.0.1 @ Copyright 2026 mintyleaf.co
                      </Text>
                    </Stack>
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
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </ActionIcon>
      </Tooltip>
    </>
  );
}
