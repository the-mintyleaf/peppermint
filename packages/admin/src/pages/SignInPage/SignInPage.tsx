"use client";

import {
  Anchor,
  Button,
  Center,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title
} from "@peppermint/ui";


import { useState } from "react";
import { GoogleIcon } from "./components/GoogleIcon";
import { SignInForm } from "./components/SignInForm";
import type { SignInPageProps } from "./SignInPage.types";
import { AUTH_TOKEN_KEYS } from "./utils/authTokenKeys";
import { decodeJWT } from "./utils/decodeJWT";
import { AppleLogoIcon, DiscordLogoIcon, LeafIcon } from "@phosphor-icons/react/dist/ssr";

export function SignInPage({
  heading = ["Sign into", "to your portal."],
  subheading = "Enter your credentials to access your account.",
  icon,
  loginApi,
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
}: SignInPageProps) {
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await fetch(loginApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          skipEmailValidation
            ? { username, password }
            : { email: username, password }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        onError?.(data);
        return;
      }

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

      try {
        const userResponse = await fetch("/api/auth/users/me/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem("user_data", JSON.stringify(userData));
        }
      } catch (userError) {
        console.error("Failed to fetch user data:", userError);
      }

      setTimeout(() => {
        window.location.href = successRedirectUrl;
      }, 1000);
    } catch (error: unknown) {
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (
    provider: "google" | "apple" | "discord",
    callback?: () => void
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
    <Center h="100vh">


      <Stack>

        <Center>
          <Group gap={4} px="md" py={4}>
            <LeafIcon color="var(--mantine-color-brand-5)" weight="fill" />
            <Title size="xs" c="brand.6">
              mintyflow <span style={{ color: "var(--mantine-color-gray-5)" }}>by mintyleaf.co</span>
            </Title>
          </Group>
        </Center>


        <Paper w={{ base: "100%", sm: 440 }} p={{ base: "md", lg: "3rem" }} >

          <Stack gap="md" w="100%">


            <Stack gap="xs" align="center">
              <Title size="2rem" order={2} ta="center" fw={500} lh="100%">
                {heading[0]}
                {" "}
                <span style={{ color: "var(--mantine-color-brand-5)" }}>
                  {heading[1]}
                </span>
              </Title>
              <Text c="dimmed" size="xs" ta="center" maw={400}>
                {subheading}
              </Text>
            </Stack>

            <Stack gap="xs" py="md">
              {!showMagicLink ? (
                <>
                  <SignInForm
                    onSubmit={handleSignIn}
                    isLoading={isLoading}
                    onForgotPassword={onForgotPassword}
                    skipEmailValidation={skipEmailValidation}
                    disableSignUp={disableSignUp}
                    disableForgotPassword={disableForgotPassword}
                  />

                  {hasAnySocial && (
                    <>
                      <Divider
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
                              handleSocialLogin("google", onGoogleLogin)
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
                              <AppleLogoIcon weight="fill" size={20} />
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
                              handleSocialLogin("discord", onDiscordLogin)
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
                    onChange={(e) => setMagicLinkEmail(e.currentTarget.value)}
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
            <Text ta="center" size="10px" >
              By signing in, you agree to our{" "}
              <Anchor href="/terms" c="brand.4">Terms of Service</Anchor> and{" "}
              <Anchor href="/privacy" c="brand.4">Privacy Policy</Anchor>.
            </Text>


            <Text ta="center" size="10px" c="gray.5">
              Versoin v1.0.1 @ Copyright 2026 mintyleaf.co
            </Text>
          </Stack>

        </Center>
      </Stack>
    </Center>
  );
}
