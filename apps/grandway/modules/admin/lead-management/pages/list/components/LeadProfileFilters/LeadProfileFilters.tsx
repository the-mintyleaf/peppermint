"use client";

import { Badge, Button, Popover, Select, Stack, Text } from "@peppermint/ui";
import { FunnelSimpleIcon } from "@phosphor-icons/react/dist/csr/FunnelSimple";
import {
  LANGUAGE_TEST_TYPE_OPTIONS,
  QUALIFICATION_LEVEL_OPTIONS,
} from "@/components/academic";
import { LANGUAGE_TEST_STATUS_OPTIONS } from "../../../../studyInterest.labels";
import type { LeadListFilters } from "../../../../leadManagement.types";
import type { LeadProfileFiltersProps } from "./LeadProfileFilters.types";

/** Narrows a Select value to its option set; `null`/unknown → `undefined` (no filter). */
function pick<TValue extends string>(
  options: { value: TValue }[],
  value: string | null,
): TValue | undefined {
  return options.find((option) => option.value === value)?.value;
}

/**
 * The three server-side profile filters (`GET /leads/` —
 * `highest_qualification_level`, `language_test_status`,
 * `language_test_type`). They live behind one "Profile" button rather than as
 * column filters: the list shape the board loads carries neither the study
 * interest nor the certificates, so they scope the board's fetch instead of
 * filtering rows in memory. The badge counts the active ones so a narrowed
 * board never looks like the whole set.
 */
export function LeadProfileFilters({
  value,
  onChange,
}: LeadProfileFiltersProps) {
  const activeCount = Object.values(value).filter(Boolean).length;

  const update = (patch: Partial<LeadListFilters>) =>
    onChange({ ...value, ...patch });

  return (
    <Popover position="bottom-end" shadow="md" width={260} withinPortal>
      <Popover.Target>
        <Button
          size="xs"
          variant={activeCount > 0 ? "light" : "default"}
          leftSection={<FunnelSimpleIcon size={14} aria-hidden />}
          rightSection={
            activeCount > 0 ? (
              <Badge size="xs" circle aria-label={`${activeCount} active`}>
                {activeCount}
              </Badge>
            ) : null
          }
        >
          Profile
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="sm">
          <Text size="xs" c="dimmed">
            Narrow the board by what is on each lead&apos;s profile.
          </Text>
          <Select
            size="xs"
            label="Highest qualification"
            placeholder="Any"
            data={QUALIFICATION_LEVEL_OPTIONS}
            clearable
            comboboxProps={{ withinPortal: false }}
            value={value.highestQualificationLevel ?? null}
            onChange={(next) =>
              update({
                highestQualificationLevel: pick(
                  QUALIFICATION_LEVEL_OPTIONS,
                  next,
                ),
              })
            }
          />
          <Select
            size="xs"
            label="Language test status"
            placeholder="Any"
            data={LANGUAGE_TEST_STATUS_OPTIONS}
            clearable
            comboboxProps={{ withinPortal: false }}
            value={value.languageTestStatus ?? null}
            onChange={(next) =>
              update({
                languageTestStatus: pick(LANGUAGE_TEST_STATUS_OPTIONS, next),
              })
            }
          />
          <Select
            size="xs"
            label="Holds a certificate"
            description="Leads with at least one result of this test."
            placeholder="Any"
            data={LANGUAGE_TEST_TYPE_OPTIONS}
            clearable
            comboboxProps={{ withinPortal: false }}
            value={value.languageTestType ?? null}
            onChange={(next) =>
              update({
                languageTestType: pick(LANGUAGE_TEST_TYPE_OPTIONS, next),
              })
            }
          />
          {activeCount > 0 ? (
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              onClick={() => onChange({})}
            >
              Clear profile filters
            </Button>
          ) : null}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
