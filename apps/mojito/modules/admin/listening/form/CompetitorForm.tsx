"use client";

import { Stack, TextInput, Select, Button } from "@zetsel/ui";
import { useForm } from "@mantine/form";
import type { CompetitorFormProps } from "./competitorForm.types";
import type { CompetitorRow } from "../competitors.types";

const PLATFORMS = ["instagram", "x", "linkedin", "tiktok", "facebook"];

export function CompetitorForm({ initialValues, onSubmit, isLoading }: CompetitorFormProps) {
  const form = useForm({
    initialValues: {
      id: initialValues?.id ?? "",
      handle: initialValues?.handle ?? "",
      platform: initialValues?.platform ?? "instagram",
      volumeSeries: initialValues?.volumeSeries ?? [],
    },
    validate: {
      handle: (v) => (!v?.trim() ? "Required" : null),
    },
  });

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md" p="md">
        <TextInput
          label="Handle"
          placeholder="@competitor"
          required
          disabled={isLoading}
          {...form.getInputProps("handle")}
        />
        <Select
          label="Platform"
          data={PLATFORMS.map((p) => ({
            label: p.charAt(0).toUpperCase() + p.slice(1),
            value: p,
          }))}
          disabled={isLoading}
          {...form.getInputProps("platform")}
        />
        <Button type="submit" loading={isLoading} fullWidth>
          {initialValues?.id ? "Update Competitor" : "Add Competitor"}
        </Button>
      </Stack>
    </form>
  );
}
