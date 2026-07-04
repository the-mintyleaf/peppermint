import { Anchor, Button, Stack, Text, TextInput } from "@peppermint/ui";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";
import { useForm } from "@mantine/form";

interface MfaChallengeFormProps {
  onSubmit: (code: string) => void;
  isLoading: boolean;
  onBackToSignIn: () => void;
}

export function MfaChallengeForm({
  onSubmit,
  isLoading,
  onBackToSignIn,
}: MfaChallengeFormProps) {
  const form = useForm({
    initialValues: { code: "" },
    validate: {
      code: (value: string) => (!value.trim() ? "Code is required" : null),
    },
  });

  const handleSubmit = form.onSubmit((values) => onSubmit(values.code));

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Enter the 6-digit code from your authenticator app, or one of your
          recovery codes.
        </Text>

        <TextInput
          size="md"
          placeholder="123456"
          required
          autoFocus
          {...form.getInputProps("code")}
          disabled={isLoading}
          leftSection={
            <ShieldCheckIcon size={16} weight="fill" style={{ opacity: 0.5 }} />
          }
        />

        <Button
          type="submit"
          loading={isLoading}
          fullWidth
          size="md"
          color="brand"
        >
          Verify
        </Button>

        <Anchor
          component="button"
          type="button"
          size="xs"
          c="dimmed"
          onClick={onBackToSignIn}
        >
          Back to sign in
        </Anchor>
      </Stack>
    </form>
  );
}
