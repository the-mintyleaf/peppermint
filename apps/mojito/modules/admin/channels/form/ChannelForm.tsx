"use client";

import {
  Stack,
  TextInput,
  Select,
  Textarea,
  NumberInput,
  Button,
} from "@peppermint/ui";
import { useForm } from "@mantine/form";
import type { ChannelFormProps } from "./ChannelForm.types";
import type { Channel } from "../channels.types";

export function ChannelForm({
  initialValues,
  onSubmit,
  isLoading,
}: ChannelFormProps) {
  const form = useForm<Channel>({
    initialValues: initialValues ?? {
      id: "",
      platform: "instagram",
      handle: "",
      displayName: "",
      url: "",
      status: "disconnected",
      connectedAt: new Date().toISOString().split("T")[0],
      followersCount: undefined,
      notes: "",
    },
    validate: {
      platform: (v) => (!v ? "Required" : null),
      handle: (v) => (!v ? "Required" : null),
      displayName: (v) => (!v ? "Required" : null),
      url: (v) =>
        !v
          ? "Required"
          : !/^https?:\/\/.+/.test(v)
            ? "Must be a valid URL"
            : null,
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <Select
          label="Platform"
          placeholder="Select platform"
          required
          disabled={isLoading}
          data={[
            { value: "instagram", label: "Instagram" },
            { value: "twitter", label: "X / Twitter" },
            { value: "facebook", label: "Facebook" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "pinterest", label: "Pinterest" },
          ]}
          {...form.getInputProps("platform")}
        />
        <TextInput
          label="Handle"
          placeholder="@your_handle"
          required
          disabled={isLoading}
          {...form.getInputProps("handle")}
        />
        <TextInput
          label="Display Name"
          placeholder="Brand Name"
          required
          disabled={isLoading}
          {...form.getInputProps("displayName")}
        />
        <TextInput
          label="Profile URL"
          placeholder="https://instagram.com/your_handle"
          type="url"
          required
          disabled={isLoading}
          {...form.getInputProps("url")}
        />
        <Select
          label="Status"
          disabled={isLoading}
          data={[
            { value: "connected", label: "Connected" },
            { value: "disconnected", label: "Disconnected" },
            { value: "expired", label: "Expired" },
            { value: "error", label: "Error" },
          ]}
          {...form.getInputProps("status")}
        />
        <NumberInput
          label="Followers Count"
          placeholder="0"
          min={0}
          disabled={isLoading}
          {...form.getInputProps("followersCount")}
        />
        <TextInput
          label="Connected Date"
          placeholder="YYYY-MM-DD"
          disabled={isLoading}
          {...form.getInputProps("connectedAt")}
        />
        <Textarea
          label="Notes"
          placeholder="Optional notes about this account"
          disabled={isLoading}
          {...form.getInputProps("notes")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Channel" : "Add Channel"}
        </Button>
      </Stack>
    </form>
  );
}
