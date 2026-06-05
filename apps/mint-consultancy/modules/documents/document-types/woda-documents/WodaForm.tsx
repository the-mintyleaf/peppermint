"use client";

import { Stack, TextInput, Textarea, Button } from "@zetsel/ui";
import { useForm } from "@zetsel/ui";
import type { DocumentFormProps, WodaContent } from "../../documents.types";

export function WodaForm({ onSubmit, isLoading }: DocumentFormProps) {
  const form = useForm<WodaContent>({
    initialValues: {
      title: "",
      documentNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      recipient: "",
      body: "",
    },
    validate: {
      title: (v) => (!v ? "Title is required" : null),
      recipient: (v) => (!v ? "Recipient is required" : null),
    },
    onSubmit: (values) => onSubmit(values),
  });

  return (
    <form onSubmit={form.onSubmit}>
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Document title"
          {...form.getInputProps("title")}
          disabled={isLoading}
          required
        />
        <TextInput
          label="Document Number"
          placeholder="WODA-2024-001"
          {...form.getInputProps("documentNumber")}
          disabled={isLoading}
        />
        <TextInput
          label="Issue Date"
          type="date"
          {...form.getInputProps("issueDate")}
          disabled={isLoading}
        />
        <TextInput
          label="Recipient"
          placeholder="Recipient name or organization"
          {...form.getInputProps("recipient")}
          disabled={isLoading}
          required
        />
        <Textarea
          label="Body"
          placeholder="Document content..."
          {...form.getInputProps("body")}
          disabled={isLoading}
          minRows={4}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          Create WODA Document
        </Button>
      </Stack>
    </form>
  );
}
