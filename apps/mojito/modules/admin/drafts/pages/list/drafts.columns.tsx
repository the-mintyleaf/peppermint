"use client";

import type { DataTableShellColumn } from "@peppermint/admin";
import { Badge, Button, Group, Text, ActionIcon } from "@peppermint/ui";
import { PenNibIcon } from "@phosphor-icons/react/dist/csr/PenNib";
import { CopySimpleIcon } from "@phosphor-icons/react/dist/csr/CopySimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteContentItem, duplicateContentItem } from "../../../content/content.api";
import { draftQueryKeys } from "../../drafts.queryKeys";
import type { DraftRow } from "../../drafts.types";

function DraftActions({ item }: { item: DraftRow }) {
  const router = useRouter();
  const qc = useQueryClient();

  const duplicate = useMutation({
    mutationFn: () => duplicateContentItem(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [draftQueryKeys.list()] }),
  });

  const remove = useMutation({
    mutationFn: () => deleteContentItem(item.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [draftQueryKeys.list()] }),
  });

  return (
    <Group gap="xs" justify="flex-end">
      <Button
        size="xs"
        variant="light"
        leftSection={<PenNibIcon size={12} />}
        onClick={() => router.push(`/admin/create?id=${item.id}`)}
      >
        Resume
      </Button>
      <ActionIcon
        size="sm"
        variant="subtle"
        loading={duplicate.isPending}
        onClick={() => duplicate.mutate()}
        aria-label="Duplicate draft"
      >
        <CopySimpleIcon size={14} />
      </ActionIcon>
      <ActionIcon
        size="sm"
        variant="subtle"
        color="red"
        loading={remove.isPending}
        onClick={() => remove.mutate()}
        aria-label="Delete draft"
      >
        <TrashIcon size={14} />
      </ActionIcon>
    </Group>
  );
}

export const draftsColumns: DataTableShellColumn<DraftRow>[] = [
  {
    accessor: "title",
    title: "Title",
    sortable: true,
    render: (item) => (
      <Text size="xs" fw={500} lineClamp={1}>{item.title}</Text>
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
          <Badge key={v.platform} size="xs" variant="dot">{v.platform}</Badge>
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
    render: (item) => new Date(item.updatedAt).toLocaleDateString(),
    width: 120,
  },
  {
    accessor: "actions",
    title: "",
    render: (item) => <DraftActions item={item} />,
    width: 200,
  },
];
