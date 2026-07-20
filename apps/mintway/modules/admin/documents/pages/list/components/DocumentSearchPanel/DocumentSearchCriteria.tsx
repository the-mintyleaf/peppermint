"use client";

import { useMemo, useState } from "react";
import {
  Button,
  Collapse,
  DateInput,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@peppermint/ui";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { documentTypeList, STATUS_META } from "@/modules/documents";
import type { DocumentStatus, DocumentType } from "@/modules/documents";
import type {
  DocumentSearchCriteriaProps,
  DocumentSearchCriteriaValues,
} from "./DocumentSearchPanel.types";

const STATUS_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

/**
 * The four criteria on the always-visible row are the ones staff actually search by —
 * who the document belongs to, what it is called, what kind it is, and where it sits in
 * the lifecycle. The rarer, more technical criteria (renderer version, case link, date
 * bounds) sit behind a disclosure so the common path stays a single scannable row.
 */
export function DocumentSearchCriteria({
  value,
  onChange,
  onClear,
  hasCriteria,
}: DocumentSearchCriteriaProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const typeOptions = useMemo(
    () =>
      documentTypeList
        .map((config) => ({ value: config.type, label: config.label }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [],
  );

  const set = <K extends keyof DocumentSearchCriteriaValues>(
    key: K,
    next: DocumentSearchCriteriaValues[K],
  ) => onChange({ ...value, [key]: next });

  return (
    <Paper withBorder p="sm" mb="sm">
      <Stack gap="sm">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
          <TextInput
            label="Applicant"
            placeholder="Name or code"
            leftSection={<MagnifyingGlassIcon size={14} aria-hidden />}
            value={value.applicant}
            onChange={(event) => set("applicant", event.currentTarget.value)}
          />
          <TextInput
            label="Document label"
            placeholder="e.g. Bank balance"
            value={value.label}
            onChange={(event) => set("label", event.currentTarget.value)}
          />
          <Select
            label="Document type"
            placeholder="Any type"
            data={typeOptions}
            value={value.type}
            onChange={(next) => set("type", (next as DocumentType) ?? null)}
            searchable
            clearable
            nothingFoundMessage="No matching type"
          />
          <Select
            label="Status"
            placeholder="Any status"
            data={STATUS_OPTIONS}
            value={value.status}
            onChange={(next) => set("status", (next as DocumentStatus) ?? null)}
            clearable
          />
        </SimpleGrid>

        <Collapse expanded={advancedOpen}>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="sm">
            <DateInput
              label="Created from"
              placeholder="Any date"
              valueFormat="YYYY-MM-DD"
              clearable
              value={value.createdFrom}
              onChange={(next) => set("createdFrom", next)}
            />
            <DateInput
              label="Created to"
              placeholder="Any date"
              valueFormat="YYYY-MM-DD"
              clearable
              value={value.createdTo}
              onChange={(next) => set("createdTo", next)}
            />
            <TextInput
              label="Template version"
              placeholder="e.g. 2.1"
              value={value.templateVersion}
              onChange={(event) =>
                set("templateVersion", event.currentTarget.value)
              }
            />
            <DateInput
              label="Updated from"
              placeholder="Any date"
              valueFormat="YYYY-MM-DD"
              clearable
              value={value.updatedFrom}
              onChange={(next) => set("updatedFrom", next)}
            />
            <DateInput
              label="Updated to"
              placeholder="Any date"
              valueFormat="YYYY-MM-DD"
              clearable
              value={value.updatedTo}
              onChange={(next) => set("updatedTo", next)}
            />
            <TextInput
              label="Application case ID"
              placeholder="Case UUID"
              value={value.applicationCaseId}
              onChange={(event) =>
                set("applicationCaseId", event.currentTarget.value)
              }
            />
          </SimpleGrid>
        </Collapse>

        <Group gap="xs">
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => setAdvancedOpen((open) => !open)}
            aria-expanded={advancedOpen}
            rightSection={
              advancedOpen ? (
                <CaretUpIcon size={12} aria-hidden />
              ) : (
                <CaretDownIcon size={12} aria-hidden />
              )
            }
          >
            {advancedOpen ? "Fewer filters" : "More filters"}
          </Button>
          {hasCriteria && (
            <Button size="compact-xs" variant="subtle" onClick={onClear}>
              Clear all
            </Button>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
