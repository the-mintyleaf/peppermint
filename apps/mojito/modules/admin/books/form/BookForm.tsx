"use client";

import {
  Stack,
  TextInput,
  Select,
  NumberInput,
  Button,
  useForm,
} from "@peppermint/ui";
import type { BookFormProps } from "./BookForm.types";
import type { Book } from "../books.types";

export function BookForm({
  initialValues,
  onSubmit,
  isLoading,
}: BookFormProps) {
  const form = useForm<Book>({
    initialValues: initialValues ?? {
      id: "",
      title: "",
      author: "",
      genre: "",
      isbn: "",
      publishedYear: new Date().getFullYear(),
      status: "available",
    },
    validate: {
      title: (v) => (!v ? "Required" : null),
      author: (v) => (!v ? "Required" : null),
      genre: (v) => (!v ? "Required" : null),
      isbn: (v) => (!v ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Title"
          placeholder="The Great Gatsby"
          required
          disabled={isLoading}
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Author"
          placeholder="F. Scott Fitzgerald"
          required
          disabled={isLoading}
          {...form.getInputProps("author")}
        />
        <TextInput
          label="Genre"
          placeholder="Fiction"
          required
          disabled={isLoading}
          {...form.getInputProps("genre")}
        />
        <TextInput
          label="ISBN"
          placeholder="978-0-000-00000-0"
          required
          disabled={isLoading}
          {...form.getInputProps("isbn")}
        />
        <NumberInput
          label="Published Year"
          min={1000}
          max={new Date().getFullYear()}
          disabled={isLoading}
          {...form.getInputProps("publishedYear")}
        />
        <Select
          label="Status"
          data={[
            { value: "available", label: "Available" },
            { value: "checked-out", label: "Checked Out" },
            { value: "reserved", label: "Reserved" },
          ]}
          disabled={isLoading}
          {...form.getInputProps("status")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Book" : "Add Book"}
        </Button>
      </Stack>
    </form>
  );
}
