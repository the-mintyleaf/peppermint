"use client";

import { Group, Select, MultiSelect, Button } from "@peppermint/ui";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import type { ContentFilter } from "../../../../module.api";

interface ContentFiltersProps {
  filter: ContentFilter;
  onChange: (filter: ContentFilter) => void;
}

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
];

const STATUS_OPTIONS = [
  { value: "generated", label: "Generated" },
  { value: "approved", label: "Approved" },
  { value: "published", label: "Published" },
  { value: "failed", label: "Failed" },
];

export function ContentFilters({ filter, onChange }: ContentFiltersProps) {
  const hasFilters = !!(
    filter.platform ||
    filter.status ||
    filter.automationId
  );

  return (
    <Group gap="sm" wrap="wrap">
      <FunnelIcon size={16} aria-label="Filters" />
      <Select
        placeholder="Platform"
        data={PLATFORM_OPTIONS}
        value={filter.platform ?? null}
        onChange={(v) =>
          onChange({ ...filter, platform: v ?? undefined, page: 1 })
        }
        clearable
        size="xs"
        w={140}
      />
      <Select
        placeholder="Status"
        data={STATUS_OPTIONS}
        value={filter.status ?? null}
        onChange={(v) =>
          onChange({ ...filter, status: v ?? undefined, page: 1 })
        }
        clearable
        size="xs"
        w={140}
      />
      {hasFilters && (
        <Button
          size="xs"
          variant="subtle"
          color="gray"
          leftSection={<XIcon size={12} />}
          onClick={() => onChange({ page: 1 })}
        >
          Clear
        </Button>
      )}
    </Group>
  );
}
