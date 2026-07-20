"use client";

import {
  Alert,
  Button,
  Divider,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@peppermint/ui";
import {
  AppleLogoIcon,
  DiscordLogoIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr";

import { GoogleIcon } from "./GoogleIcon";
import { SignInForm } from "./SignInForm";
import { MfaChallengeForm } from "./MfaChallengeForm";
import type { SignInLayoutProps } from "../SignInPage.types";

/**
 * The interactive body of the sign-in screen — error alert plus whichever of the
 * three forms the current phase calls for. Shared by every layout variant; the
 * surrounding chrome and the heading block belong to the layout.
 */
export function SignInPanelContent({ controller, page }: SignInLayoutProps) {
  const {
    phase,
    errorMessage,
    isLoading,
    identifierField,
    showMagicLink,
    setShowMagicLink,
    magicLinkEmail,
    setMagicLinkEmail,
    onSignIn,
    onMfaSubmit,
    onBackToSignIn,
    onMagicLinkSubmit,
    onSocialLogin,
  } = controller;

  const {
    onForgotPassword,
    disableSignUp = false,
    disableForgotPassword = false,
    hasGoogleLogin = false,
    hasAppleLogin = false,
    hasDiscordLogin = false,
    hasMagicLinkLogin = false,
    onGoogleLogin,
    onAppleLogin,
    onDiscordLogin,
  } = page;

  const socialProviders = [
    hasGoogleLogin,
    hasAppleLogin,
    hasDiscordLogin,
    hasMagicLinkLogin,
  ].filter(Boolean).length;

  const hasAnySocial = socialProviders > 0;

  return (
    <Stack gap="xs" py="md">
      {errorMessage && (
        <Alert
          color="red"
          icon={<WarningIcon size={18} weight="fill" aria-hidden />}
        >
          {errorMessage}
        </Alert>
      )}

      {phase === "mfa" ? (
        <MfaChallengeForm
          onSubmit={onMfaSubmit}
          isLoading={isLoading}
          onBackToSignIn={onBackToSignIn}
        />
      ) : !showMagicLink ? (
        <>
          <SignInForm
            onSubmit={onSignIn}
            isLoading={isLoading}
            onForgotPassword={onForgotPassword}
            identifierField={identifierField}
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

              <SimpleGrid cols={Math.min(socialProviders, 3)} spacing="xs">
                {hasGoogleLogin && (
                  <Button
                    variant="default"
                    size="md"
                    leftSection={<GoogleIcon />}
                    onClick={() => onSocialLogin(onGoogleLogin)}
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
                    leftSection={<AppleLogoIcon weight="fill" size={20} />}
                    onClick={() => onSocialLogin(onAppleLogin)}
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
                    onClick={() => onSocialLogin(onDiscordLogin)}
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
              We&apos;ll email you a link to sign in instantly.
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
            onClick={onMagicLinkSubmit}
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
  );
}
