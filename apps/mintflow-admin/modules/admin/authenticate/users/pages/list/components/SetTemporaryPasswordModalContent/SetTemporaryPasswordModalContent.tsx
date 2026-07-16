"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Group,
  PasswordInput,
  Stack,
  modals,
  notifications,
  useForm,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { setTemporaryPassword } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { SetTemporaryPasswordModalContentProps } from "./SetTemporaryPasswordModalContent.types";

interface SetTemporaryPasswordFormValues {
  temporary_password: string;
}

export function SetTemporaryPasswordModalContent({
  userId,
}: SetTemporaryPasswordModalContentProps) {
  const queryClient = useQueryClient();

  const form = useForm<SetTemporaryPasswordFormValues>({
    initialValues: { temporary_password: "" },
    validate: {
      temporary_password: (value) =>
        value.length < 8 ? "Must be at least 8 characters" : null,
    },
  });

  const mutation = useMutation({
    mutationFn: (values: SetTemporaryPasswordFormValues) =>
      setTemporaryPassword(userId, values.temporary_password),
    onSuccess: () => {
      notifications.show({
        color: "green",
        message: "Temporary password set.",
      });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.listKey() });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({ color: "red", message: getApiErrorMessage(error) });
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
      <Stack gap="md">
        <PasswordInput
          label="Temporary password"
          required
          disabled={mutation.isPending}
          {...form.getInputProps("temporary_password")}
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
            Set password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
