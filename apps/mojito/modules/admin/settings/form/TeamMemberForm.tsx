"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@mantine/form";
import type { TeamMemberFormProps } from "./teamMemberForm.types";
import type { TeamMemberRow } from "../team.types";

export function TeamMemberForm({ initialValues, onSubmit, isLoading }: TeamMemberFormProps) {
  const isInvite = !initialValues?.id;

  const form = useForm({
    initialValues: {
      id: initialValues?.id ?? "",
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      role: initialValues?.role ?? "editor",
      joinedAt: initialValues?.joinedAt ?? new Date(),
      status: initialValues?.status ?? "invited",
    },
    validate: {
      email: (v) => {
        if (!isInvite) return null;
        if (!v?.trim()) return "Required";
        if (!/^\S+@\S+$/.test(v)) return "Invalid email";
        return null;
      },
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        {isInvite && (
          <TextInput
            label="Email"
            type="email"
            placeholder="colleague@company.com"
            required
            disabled={isLoading}
            {...form.getInputProps("email")}
          />
        )}
        <Select
          label="Role"
          data={[
            { label: "Admin — full access", value: "admin" },
            { label: "Editor — create & publish", value: "editor" },
            { label: "Viewer — read only", value: "viewer" },
          ]}
          disabled={isLoading || initialValues?.role === "owner"}
          {...form.getInputProps("role")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {isInvite ? "Send Invite" : "Update Role"}
        </Button>
      </Stack>
    </form>
  );
}
