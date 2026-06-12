"use client";

import { Stack, TextInput, Select, Button, useForm } from "@zetsel/ui";
import type { MemberFormProps } from "./MemberForm.types";
import type { Member } from "../members.types";

export function MemberForm({ initialValues, onSubmit, isLoading }: MemberFormProps) {
  const form = useForm<Member>({
    initialValues: initialValues ?? {
      id: "",
      name: "",
      email: "",
      phone: "",
      membershipType: "basic",
      joinedDate: new Date().toISOString().split("T")[0],
      status: "active",
    },
    validate: {
      name:  (v) => (!v ? "Required" : null),
      email: (v) => (!v ? "Required" : !/^\S+@\S+$/.test(v) ? "Invalid email" : null),
      phone: (v) => (!v ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput label="Name"  placeholder="Alice Johnson" required disabled={isLoading} {...form.getInputProps("name")} />
        <TextInput label="Email" placeholder="alice@example.com" type="email" required disabled={isLoading} {...form.getInputProps("email")} />
        <TextInput label="Phone" placeholder="+1-555-0100" required disabled={isLoading} {...form.getInputProps("phone")} />
        <Select
          label="Membership Type"
          data={[
            { value: "basic",   label: "Basic" },
            { value: "premium", label: "Premium" },
          ]}
          disabled={isLoading}
          {...form.getInputProps("membershipType")}
        />
        <TextInput label="Joined Date" type="date" disabled={isLoading} {...form.getInputProps("joinedDate")} />
        <Select
          label="Status"
          data={[
            { value: "active",    label: "Active" },
            { value: "suspended", label: "Suspended" },
          ]}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Member" : "Add Member"}
        </Button>
      </Stack>
    </form>
  );
}
