"use client";

import {
  ActionIcon,
  Anchor,
  Button,
  Center,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  Title,
  Tooltip,
  useComputedColorScheme,
  useMantineColorScheme,
  useForm,
} from "@peppermint/ui";
import { useState } from "react";
import {
  LeafIcon,
  LockKeyIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { PasswordChangePageProps } from "./PasswordChangePage.types";

interface FormValues {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  AUTH_PASSWORD_INVALID: "Your current password is incorrect.",
  AUTH_PASSWORD_REUSE_BLOCKED:
    "You've used this password recently. Choose a different one.",
  VALIDATION_ERROR: "Password does not meet the requirements.",
};

export function PasswordChangePage({
  changePasswordApi,
  successRedirectUrl,
  onSuccess,
  onError,
}: PasswordChangePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  const form = useForm<FormValues>({
    initialValues: { old_password: "", new_password: "", confirm_password: "" },
    validate: {
      old_password: (v) => (!v ? "Current password is required" : null),
      new_password: (v) =>
        v.length < 12 ? "Password must be at least 12 characters" : null,
      confirm_password: (v, values) =>
        v !== values.new_password ? "Passwords do not match" : null,
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setIsLoading(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const response = await fetch(changePasswordApi, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          old_password: values.old_password,
          new_password: values.new_password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        onError?.(data);

        const code = data?.error?.code as string | undefined;
        const message = code
          ? (ERROR_MESSAGES[code] ??
            data?.error?.message ??
            "Failed to update password")
          : "Failed to update password";

        if (code === "AUTH_PASSWORD_INVALID") {
          form.setErrors({ old_password: message });
        } else {
          form.setErrors({ new_password: message });
        }
        return;
      }

      setSucceeded(true);
      onSuccess?.();

      if (successRedirectUrl) {
        setTimeout(() => {
          window.location.href = successRedirectUrl;
        }, 1500);
      }
    } catch (error) {
      onError?.(error);
      form.setErrors({ new_password: "Something went wrong. Try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Center h="100vh">
        <Stack>
          <Center>
            <Group gap={4} px="md" py={4}>
              <LeafIcon color="var(--mantine-color-brand-5)" weight="fill" />
              <Title size="xs" c="brand.6">
                mintyflow{" "}
                <span style={{ color: "var(--mantine-color-gray-5)" }}>
                  by mintyleaf.co
                </span>
              </Title>
            </Group>
          </Center>

          <Paper w={{ base: "100%", sm: 440 }} p={{ base: "md", lg: "3rem" }}>
            <Stack gap="md" w="100%">
              <Stack gap="xs" align="center">
                <Center mb={4}>
                  <LockKeyIcon
                    size={36}
                    color="var(--mantine-color-brand-5)"
                    weight="duotone"
                  />
                </Center>
                <Title size="2rem" order={2} ta="center" fw={500} lh="100%">
                  Change your{" "}
                  <span style={{ color: "var(--mantine-color-brand-5)" }}>
                    password.
                  </span>
                </Title>
                <Text c="dimmed" size="xs" ta="center" maw={360}>
                  Enter your current password, then choose a new one. Must be at
                  least 12 characters and not previously used.
                </Text>
              </Stack>

              {succeeded ? (
                <Stack gap="xs" align="center" py="md">
                  <Text fw={600} size="lg" c="teal" ta="center">
                    Password updated!
                  </Text>
                  <Text c="dimmed" size="sm" ta="center">
                    {successRedirectUrl
                      ? "Redirecting you now…"
                      : "Your password has been changed successfully."}
                  </Text>
                </Stack>
              ) : (
                <form onSubmit={form.onSubmit(handleSubmit)}>
                  <Stack gap="md" py="md">
                    <PasswordInput
                      size="md"
                      label="Current password"
                      placeholder="Your existing password"
                      required
                      {...form.getInputProps("old_password")}
                    />
                    <PasswordInput
                      size="md"
                      label="New password"
                      placeholder="At least 12 characters"
                      required
                      {...form.getInputProps("new_password")}
                    />
                    <PasswordInput
                      size="md"
                      label="Confirm new password"
                      placeholder="Re-enter your new password"
                      required
                      {...form.getInputProps("confirm_password")}
                    />
                    <Button
                      type="submit"
                      size="md"
                      color="black"
                      fullWidth
                      h={50}
                      mt="xs"
                      loading={isLoading}
                    >
                      Update password
                    </Button>
                  </Stack>
                </form>
              )}
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
