"use client";

import {
  Button,
  Group,
  Loader,
  Stack,
  Text,
  TextInput,
  notifications,
  useForm,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { getApiError, getApiErrorMessage } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { QueryErrorState } from "@/components/QueryErrorState";
import { updateProfile } from "../account-settings.api";
import type {
  ProfileFormProps,
  ProfileUpdateValues,
} from "../account-settings.types";

function ProfileForm({ user }: ProfileFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<ProfileUpdateValues>({
    initialValues: {
      display_name: user.display_name,
      email: user.email ?? "",
    },
    validate: {
      display_name: (value) => (!value.trim() ? "Required" : null),
      email: (value) =>
        value && !/^\S+@\S+$/.test(value) ? "Invalid email" : null,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: ProfileUpdateValues) => updateProfile(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      notifications.show({
        color: "green",
        title: "Profile updated",
        message: "Your details have been saved.",
      });
      form.resetDirty();
    },
    onError: (error) => {
      const apiError = getApiError(error);
      if (apiError.code === "AUTH_EMAIL_ALREADY_EXISTS") {
        form.setFieldError("email", getApiErrorMessage(error));
        return;
      }
      notifications.show({
        color: "red",
        title: "Couldn't update profile",
        message: getApiErrorMessage(error),
      });
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Stack gap="md">
        <TextInput
          label="Display name"
          required
          disabled={mutation.isPending}
          {...form.getInputProps("display_name")}
        />
        <TextInput
          label="Email"
          type="email"
          description="Used for account notifications."
          disabled={mutation.isPending}
          {...form.getInputProps("email")}
        />
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Username <strong>{user.username}</strong> can&apos;t be changed
            here.
          </Text>
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!form.isDirty()}
          >
            Save changes
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function ProfileTab() {
  const { user, isLoading, isError, isRefetching, refetch } = useCurrentUser();

  return (
    <Stack gap="md" maw={480}>
      {isError ? (
        <QueryErrorState
          message="Couldn't load your profile."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      ) : isLoading || !user ? (
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      ) : (
        <ProfileForm key={user.id} user={user} />
      )}
    </Stack>
  );
}
