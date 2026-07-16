"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Group,
  NumberInput,
  Stack,
  Textarea,
  modals,
  notifications,
  useForm,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { lockUser } from "../../../../users.api";
import { usersQueryKeys } from "../../../../users.queryKeys";
import type { LockAccountModalContentProps } from "./LockAccountModalContent.types";

interface LockAccountFormValues {
  reason: string;
  duration_minutes: number | "";
}

export function LockAccountModalContent({
  userId,
}: LockAccountModalContentProps) {
  const queryClient = useQueryClient();

  const form = useForm<LockAccountFormValues>({
    initialValues: { reason: "", duration_minutes: "" },
    validate: {
      reason: (value) => (!value ? "A reason is required" : null),
    },
  });

  const lockMutation = useMutation({
    mutationFn: (values: LockAccountFormValues) =>
      lockUser(userId, {
        reason: values.reason,
        ...(values.duration_minutes !== ""
          ? { duration_minutes: Number(values.duration_minutes) }
          : {}),
      }),
    onSuccess: () => {
      notifications.show({ color: "green", message: "Account locked." });
      queryClient.invalidateQueries({ queryKey: usersQueryKeys.listKey() });
      modals.closeAll();
    },
    onError: (error) => {
      notifications.show({ color: "red", message: getApiErrorMessage(error) });
    },
  });

  return (
    <form onSubmit={form.onSubmit((values) => lockMutation.mutate(values))}>
      <Stack gap="md">
        <Textarea
          label="Reason"
          required
          autosize
          minRows={2}
          disabled={lockMutation.isPending}
          {...form.getInputProps("reason")}
        />
        <NumberInput
          label="Duration (minutes)"
          description="Leave blank to lock indefinitely"
          min={1}
          disabled={lockMutation.isPending}
          {...form.getInputProps("duration_minutes")}
        />
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={() => modals.closeAll()}
            disabled={lockMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" color="red" loading={lockMutation.isPending}>
            Lock account
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
