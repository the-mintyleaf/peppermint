import {
  Button,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Anchor,
} from "@peppermint/ui";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { KeyIcon } from "@phosphor-icons/react/dist/csr/Key";
import { useForm } from "@mantine/form";
import type { SignInIdentifierField } from "../SignInPage.types";

interface SignInFormProps {
  onSubmit: (identifier: string, password: string) => void;
  isLoading: boolean;
  onForgotPassword?: () => void;
  identifierField: SignInIdentifierField;
  disableSignUp?: boolean;
  disableForgotPassword?: boolean;
}

export function SignInForm({
  onSubmit,
  isLoading,
  onForgotPassword,
  identifierField,
  disableSignUp = false,
  disableForgotPassword = false,
}: SignInFormProps) {
  const isEmail = identifierField === "email";

  const form = useForm({
    initialValues: {
      identifier: "",
      password: "",
    },
    validate: {
      identifier: (value: string) => {
        if (!value.trim()) {
          return isEmail ? "Email is required" : "Username is required";
        }
        if (isEmail) {
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
    onSubmit(values.identifier, values.password);
  });

  const placeholder =
    identifierField === "email"
      ? "email@example.com"
      : identifierField === "identifier"
        ? "Username or email"
        : "Username";

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          size="md"
          placeholder={placeholder}
          type={isEmail ? "email" : "text"}
          required
          {...form.getInputProps("identifier")}
          disabled={isLoading}
          leftSection={
            <EnvelopeIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
          }
        />

        <PasswordInput
          size="md"
          placeholder="Password"
          required
          {...form.getInputProps("password")}
          disabled={isLoading}
          leftSection={
            <KeyIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
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
          color="brand"
        >
          {isEmail ? "Continue with email" : "Sign in"}
        </Button>
      </Stack>
    </form>
  );
}
