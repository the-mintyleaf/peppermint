"use client";

import { Group, Select, TextInput } from "@peppermint/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import type { InboxFilters as Filters } from "../../inbox.api";

interface InboxFiltersProps {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}

export function InboxFilters({ filters, onChange }: InboxFiltersProps) {
  return (
    <Group gap="sm" p="sm" wrap="nowrap">
      <TextInput
        style={{ flex: 1 }}
        size="xs"
        placeholder="Search conversations…"
        leftSection={<MagnifyingGlassIcon size={14} />}
        value={filters.search ?? ""}
        onChange={(e) =>
          onChange({ search: e.currentTarget.value || undefined })
        }
      />
      <Select
        size="xs"
        w={120}
        placeholder="Status"
        clearable
        data={[
          { label: "Open", value: "open" },
          { label: "Assigned", value: "assigned" },
          { label: "Done", value: "done" },
        ]}
        value={filters.status ?? null}
        onChange={(v) =>
          onChange({ status: (v as Filters["status"]) ?? undefined })
        }
      />
      <Select
        size="xs"
        w={120}
        placeholder="Type"
        clearable
        data={[
          { label: "Comment", value: "comment" },
          { label: "Mention", value: "mention" },
          { label: "DM", value: "dm" },
          { label: "Review", value: "review" },
        ]}
        value={filters.type ?? null}
        onChange={(v) =>
          onChange({ type: (v as Filters["type"]) ?? undefined })
        }
      />
    </Group>
  );
}
