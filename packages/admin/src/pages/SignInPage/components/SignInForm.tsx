import { useState } from "react";
import {
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Anchor,
} from "@zetsel/ui";
import { EnvelopeIcon, KeyIcon } from "@phosphor-icons/react";
import { useForm } from "@mantine/form";

interface SignInFormProps {
  onSubmit: (username: string, password: string) => void;
  isLoading: boolean;
  onForgotPassword?: () => void;
  skipEmailValidation?: boolean;
  disableSignUp?: boolean;
  disableForgotPassword?: boolean;
}

export function SignInForm({
  onSubmit,
  isLoading,
  onForgotPassword,
  skipEmailValidation = false,
  disableSignUp = false,
  disableForgotPassword = false,
}: SignInFormProps) {
  const form = useForm({
    initialValues: {
      username: "",
      password: "",
    },
    validate: {
      username: (value: string) => {
        if (!value.trim())
          return skipEmailValidation
            ? "Username is required"
            : "Email is required";
        if (!skipEmailValidation) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value))
            return "Please enter a valid email address";
        }
        return null;
      },
      password: (value: string) => {
        if (!value) return "Password is required";
        return null;
      },
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    onSubmit(values.username, values.password);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          size="md"
          radius="md"
          placeholder={skipEmailValidation ? "Username" : "email@example.com"}
          type={skipEmailValidation ? "text" : "email"}
          required
          {...form.getInputProps("username")}
          disabled={isLoading}
          rightSection={
            <EnvelopeIcon size={16} weight="duotone" style={{ opacity: 0.5 }} />
          }
        />

        <PasswordInput
          size="md"
          radius="md"
          placeholder="Password"
          required
          {...form.getInputProps("password")}
          disabled={isLoading}
          leftSection={
            <KeyIcon size={16} weight="duotone" style={{ opacity: 0.5 }} />
          }
        />

        <Group justify="space-between" my="xs">
          {!disableSignUp && (
            <Text size="xs" c="dimmed">
              No account?{" "}
              <Anchor size="xs" href="/register">
                Sign up
              </Anchor>
            </Text>
          )}
          {!disableForgotPassword && (
            <Anchor
              component="button"
              type="button"
              size="xs"
              c="dimmed"
              onClick={() => onForgotPassword?.()}
            >
              Forgot Password?
            </Anchor>
          )}
        </Group>

        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          size="md"
          radius="md"
          color="black"
          h={50}
        >
          Continue
        </Button>
      </Stack>
    </form>
  );
}
