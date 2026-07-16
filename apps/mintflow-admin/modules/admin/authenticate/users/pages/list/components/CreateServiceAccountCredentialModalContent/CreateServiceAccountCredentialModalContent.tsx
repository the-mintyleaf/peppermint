"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DateInput,
  Group,
  Stack,
  TextInput,
  modals,
  notifications,
  useForm,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { createServiceAccountCredential } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { CreateServiceAccountCredentialModalContentProps } from "./CreateServiceAccountCredentialModalContent.types";

interface CreateServiceAccountCredentialFormValues {
  name: string;
  expires_at: string | null;
}

export function CreateServiceAccountCredentialModalContent({
  userId,
  onCreated,
}: CreateServiceAccountCredentialModalContentProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateServiceAccountCredentialFormValues>({
    initialValues: { name: "", expires_at: null },
  });

  const mutation = useMutation({
    mutationFn: (values: CreateServiceAccountCredentialFormValues) =>
      createServiceAccountCredential(userId, {
        name: values.name || undefined,
        expires_at: values.expires_at,
      }),
    onSuccess: (result) => {
      onCreated(result.token);
      queryClient.invalidateQueries({
        queryKey: usersQueryKeys.serviceAccountCredentialsKey(userId),
      });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({ color: "red", message: getApiErrorMessage(error) });
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="Optional"
          disabled={mutation.isPending}
          {...form.getInputProps("name")}
        />
        <DateInput
          label="Expires at"
          placeholder="Never expires"
          clearable
          disabled={mutation.isPending}
          {...form.getInputProps("expires_at")}
        />
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => modals.closeAll()}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            Create credential
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
