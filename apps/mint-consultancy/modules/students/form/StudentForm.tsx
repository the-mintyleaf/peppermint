"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { StudentFormProps } from "./StudentForm.types";
import type { Student } from "../students.types";

export function StudentForm({
  initialValues,
  onSubmit,
  isLoading,
}: StudentFormProps) {
  const form = useForm<Student>({
    initialValues: initialValues ?? {
      id: "",
      fullName: "",
      email: "",
      phone: "",
      program: "",
      nationality: "",
      status: "active",
      enrolledAt: new Date().toISOString().split("T")[0],
    },
    validate: {
      fullName: (value) => (!value ? "Full name is required" : null),
      email: (value) => {
        if (!value) return "Email is required";
        if (!/^\S+@\S+$/.test(value)) return "Invalid email";
        return null;
      },
      phone: (value) => (!value ? "Phone is required" : null),
      program: (value) => (!value ? "Program is required" : null),
      nationality: (value) => (!value ? "Nationality is required" : null),
    },
    onSubmit,
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md" p="md">
        <TextInput
          label="Full Name"
          placeholder="Enter student full name"
          {...form.getInputProps("fullName")}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Email"
          placeholder="student@example.com"
          {...form.getInputProps("email")}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Phone"
          placeholder="+1-234-567-8900"
          {...form.getInputProps("phone")}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Program"
          placeholder="e.g., Computer Science"
          {...form.getInputProps("program")}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Nationality"
          placeholder="e.g., American"
          {...form.getInputProps("nationality")}
          disabled={isLoading}
          required
        />

        <TextInput
          label="Enrolled At"
          type="date"
          {...form.getInputProps("enrolledAt")}
          disabled={isLoading}
        />

        <Select
          label="Status"
          placeholder="Select status"
          {...form.getInputProps("status")}
          disabled={isLoading}
          data={[
            { value: "active", label: "Active" },
            { value: "on-leave", label: "On Leave" },
            { value: "graduated", label: "Graduated" },
            { value: "dropped", label: "Dropped" },
          ]}
        />

        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Student" : "Create Student"}
        </Button>
      </Stack>
    </form>
  );
}
