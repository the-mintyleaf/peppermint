import type { DataTableColumn } from "mantine-datatable";
import type { ContentItem } from "@/modules/admin/shared/domain.types";
import { Badge, Group, Text } from "@zetsel/ui";

export const draftsColumns: DataTableColumn<ContentItem>[] = [
  {
    accessor: "title",
    title: "Title",
    render: (item) => (
      <Text size="sm" fw={500} lineClamp={1}>
        {item.title}
      </Text>
    ),
  },
  {
    accessor: "source",
    title: "Source",
    render: (item) => (
      <Badge size="xs" variant="light" color={item.source === "agent" ? "violet" : "gray"}>
        {item.source}
      </Badge>
    ),
    width: 90,
  },
  {
    accessor: "variants",
    title: "Platforms",
    render: (item) => (
      <Group gap={4}>
        {item.variants.slice(0, 3).map((v) => (
          <Badge key={v.platform} size="xs" variant="dot">
            {v.platform}
          </Badge>
        ))}
        {item.variants.length > 3 && (
          <Text size="xs" c="dimmed">+{item.variants.length - 3}</Text>
        )}
      </Group>
    ),
  },
  {
    accessor: "updatedAt",
    title: "Last Updated",
    render: (item) => (
      <Text size="xs" c="dimmed">
        {new Date(item.updatedAt).toLocaleDateString()}
      </Text>
    ),
    width: 120,
  },
];
