"use client";

import { useState } from "react";
import {
  Button,
  Divider,
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
  SettingsTabProps,
} from "../account-settings.types";
import { SettingsHeader } from "./SettingsHeader";
import { SettingsRow } from "./SettingsRow";
import { SettingsSubScreen } from "./SettingsSubScreen";

function ProfileForm({ user, onSaved }: ProfileFormProps) {
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
    onSuccess: (updated) => {
      // The PATCH returns the full updated user, so write it straight into the
      // cache — the overview then shows fresh values immediately, with no stale
      // window or refetch that could fail and flip the tab to an error state.
      queryClient.setQueryData(["auth", "me"], updated);
      notifications.show({
        color: "green",
        title: "Profile updated",
        message: "Your details have been saved.",
      });
      onSaved();
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
      <Stack gap="md" maw={420}>
        <TextInput
          label="Display name"
          size="xs"
          required
          disabled={mutation.isPending}
          {...form.getInputProps("display_name")}
        />
        <TextInput
          label="Email"
          type="email"
          size="xs"
          description="Used for account notifications."
          disabled={mutation.isPending}
          {...form.getInputProps("email")}
        />
        <Text size="xs" c="dimmed">
          Username <strong>{user.username}</strong> can&apos;t be changed here.
        </Text>
        <Group justify="flex-end">
          <Button
            type="submit"
            size="xs"
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

export function ProfileTab({ title, description }: SettingsTabProps) {
  const [view, setView] = useState<"overview" | "edit">("overview");
  const { user, isLoading, isError, isRefetching, refetch } = useCurrentUser();

  if (isError) {
    return (
      <Stack gap="md">
        <SettingsHeader title={title} description={description} />
        <QueryErrorState
          message="Couldn't load your profile."
          onRetry={() => refetch()}
          isRetrying={isRefetching}
        />
      </Stack>
    );
  }

  if (isLoading || !user) {
    return (
      <Stack gap="md">
        <SettingsHeader title={title} description={description} />
        <Group justify="center" py="lg">
          <Loader size="sm" />
        </Group>
      </Stack>
    );
  }

  if (view === "edit") {
    return (
      <SettingsSubScreen
        title="Edit profile"
        onBack={() => setView("overview")}
      >
        <ProfileForm
          key={user.id}
          user={user}
          onSaved={() => setView("overview")}
        />
      </SettingsSubScreen>
    );
  }

  return (
    <Stack gap="md">
      <SettingsHeader title={title} description={description} />
      <Stack gap="sm">
        <SettingsRow
          label="Display name"
          right={<Text size="xs">{user.display_name}</Text>}
        />
        <Divider />
        <SettingsRow
          label="Email"
          right={
            <Text size="xs" c={user.email ? undefined : "dimmed"}>
              {user.email || "Not set"}
            </Text>
          }
        />
        <Divider />
        <SettingsRow
          label="Username"
          description="Can't be changed here."
          right={<Text size="xs">{user.username}</Text>}
        />
      </Stack>
      <Group justify="flex-end">
        <Button size="xs" variant="default" onClick={() => setView("edit")}>
          Edit profile
        </Button>
      </Group>
    </Stack>
  );
}
