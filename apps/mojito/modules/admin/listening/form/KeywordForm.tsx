"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@mantine/form";
import type { KeywordFormProps } from "./keywordForm.types";
import type { KeywordRow } from "../keywords.types";

export function KeywordForm({ initialValues, onSubmit, isLoading }: KeywordFormProps) {
  const form = useForm({
    initialValues: {
      id: initialValues?.id ?? "",
      term: initialValues?.term ?? "",
      kind: initialValues?.kind ?? "keyword",
      volumeSeries: initialValues?.volumeSeries ?? [],
    },
    validate: {
      term: (v) => (!v?.trim() ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Term"
          placeholder="brand awareness or #hashtag"
          required
          disabled={isLoading}
          {...form.getInputProps("term")}
        />
        <Select
          label="Kind"
          data={[
            { label: "Keyword", value: "keyword" },
            { label: "Hashtag", value: "hashtag" },
          ]}
          disabled={isLoading}
          {...form.getInputProps("kind")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Keyword" : "Add Keyword"}
        </Button>
      </Stack>
    </form>
  );
}
