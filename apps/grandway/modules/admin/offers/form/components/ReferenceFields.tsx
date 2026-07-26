"use client";

import { useState } from "react";
import {
  Button,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  useQuery,
} from "@peppermint/ui";
import { useFormInstance } from "@peppermint/admin";
import { useDebounce } from "@peppermint/utils";
import { FormSection } from "@/components/FormSection";
// Concrete-file imports, never the institutions barrel — cycle-safe.
import { fetchPrograms } from "@/modules/admin/institutions/institutions.api";
import type { Program } from "@/modules/admin/institutions/institutions.types";
import { QUALIFICATION_LEVEL_OPTIONS } from "../../offers.labels";
import type { OfferCreateValues } from "../OfferCreateForm.types";

function programLabel(program: Program): string {
  return `${program.title} — ${program.institution.name}`;
}

/**
 * The offer's program reference — either a Catalogue program (sends the program
 * UUID; the backend snapshots its names) or Manual entry (free-text snapshot,
 * write-once). One of the two is REQUIRED (`OFFERS_PROGRAM_REFERENCE_REQUIRED`).
 * `reference_source` is derived from which path resolved and is never sent.
 */
export function ReferenceFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  const mode = form.values.reference_mode;

  return (
    <FormSection
      title="Program reference"
      actions={
        <Button
          variant="subtle"
          size="xs"
          disabled={isLoading}
          aria-label={
            mode === "catalogue"
              ? "Program reference is set to a catalogue program. Switch to manual entry."
              : "Program reference is set to manual entry. Switch to a catalogue program."
          }
          onClick={() =>
            form.setFieldValue(
              "reference_mode",
              mode === "catalogue" ? "manual" : "catalogue",
            )
          }
        >
          {mode === "catalogue" ? "Enter manually" : "Choose from catalogue"}
        </Button>
      }
    >
      {mode === "catalogue" ? (
        <CatalogueProgramField isLoading={isLoading} />
      ) : (
        <ManualReferenceFields isLoading={isLoading} />
      )}
    </FormSection>
  );
}

function CatalogueProgramField({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  const [searchInput, setSearchInput] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const debounced = useDebounce(searchInput, 300);
  const trimmed = debounced.trim();

  const { data, isFetching } = useQuery({
    queryKey: ["offers.program-picker", trimmed],
    queryFn: () =>
      fetchPrograms({
        page: 1,
        pageSize: 20,
        search: trimmed,
        sort: [],
        filters: {},
      }),
    enabled: trimmed.length >= 2,
  });

  const options = (data?.data ?? []).map((program) => ({
    value: program.id,
    label: programLabel(program),
  }));
  const selectData =
    selectedLabel && form.values.program
      ? [
          { value: form.values.program, label: selectedLabel },
          ...options.filter((option) => option.value !== form.values.program),
        ]
      : options;

  return (
    <Stack gap={4}>
      <Select
        label="Catalogue program"
        description="Its institution, campus and names are copied onto the offer"
        placeholder="Search programs"
        required
        searchable
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        data={selectData}
        disabled={isLoading}
        nothingFoundMessage={
          trimmed.length < 2
            ? "Type at least 2 characters"
            : isFetching
              ? "Searching…"
              : "No matches"
        }
        value={form.values.program}
        error={form.errors.program}
        onChange={(value) => {
          form.setFieldValue("program", value);
          const selected = options.find((option) => option.value === value);
          setSelectedLabel(selected?.label ?? null);
        }}
      />
      <Text size="xs" c="dimmed">
        Can&apos;t find it? Switch to Manual entry.
      </Text>
    </Stack>
  );
}

function ManualReferenceFields({ isLoading }: { isLoading: boolean }) {
  const { form } = useFormInstance<OfferCreateValues>();
  return (
    <Stack gap="md">
      <Group grow align="flex-start">
        <TextInput
          label="Institution name"
          placeholder="University of Melbourne"
          required
          disabled={isLoading}
          {...form.getInputProps("institution_name")}
        />
        <TextInput
          label="Program title"
          placeholder="Master of Data Science"
          required
          disabled={isLoading}
          {...form.getInputProps("program_title")}
        />
      </Group>
      <Group grow align="flex-start">
        <TextInput
          label="Campus name"
          placeholder="Parkville"
          disabled={isLoading}
          {...form.getInputProps("campus_name")}
        />
        <TextInput
          label="Country"
          placeholder="Australia"
          disabled={isLoading}
          {...form.getInputProps("country_name")}
        />
      </Group>
      <Select
        label="Qualification level"
        placeholder="Not specified"
        data={QUALIFICATION_LEVEL_OPTIONS}
        clearable
        disabled={isLoading}
        {...form.getInputProps("qualification_level")}
        onChange={(value) =>
          form.setFieldValue("qualification_level", value ?? "")
        }
      />
    </Stack>
  );
}
