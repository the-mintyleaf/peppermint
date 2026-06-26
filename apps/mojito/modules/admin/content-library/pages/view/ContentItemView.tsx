"use client";

import {
  Stack,
  Group,
  Text,
  Badge,
  Image,
  Tabs,
  Table,
  Button,
  Breadcrumbs,
  Anchor,
  Loader,
  Center,
  Divider,
  Paper,
} from "@peppermint/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { fetchContentItem, approveContentItem } from "../../module.api";

interface ContentItemViewProps {
  contentId: string;
}

const STATUS_COLORS: Record<string, string> = {
  generated: "blue",
  approved: "teal",
  published: "green",
  failed: "red",
};

export function ContentItemView({ contentId }: ContentItemViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["content-library", "item", contentId],
    queryFn: () => fetchContentItem(contentId),
  });

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approveContentItem(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-library"] });
    },
  });

  if (isLoading) {
    return (
      <Center h={300}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (!item) {
    return (
      <Center h={300}>
        <Text c="dimmed">Content item not found.</Text>
      </Center>
    );
  }

  const generatedAt = new Date(item.generatedAt).toLocaleString();

  return (
    <Stack gap="lg">
      <Breadcrumbs>
        <Anchor
          size="sm"
          onClick={() =>
            router.push(`/admin/automation/workflows/${item.automationId}`)
          }
        >
          {item.automationName}
        </Anchor>
        <Anchor
          size="sm"
          onClick={() =>
            router.push(`/admin/automation/workflows/${item.automationId}`)
          }
        >
          Run #{item.runId}
        </Anchor>
        <Text size="sm" c="dimmed">
          Content Item
        </Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Group gap="xs">
            <Badge size="sm" variant="outline" tt="capitalize">
              {item.platform}
            </Badge>
            <Badge size="sm" color={STATUS_COLORS[item.status] ?? "gray"}>
              {item.status}
            </Badge>
          </Group>
          <Text size="xs" c="dimmed">
            Generated {generatedAt}
          </Text>
        </Stack>

        {item.status === "generated" && (
          <Button
            leftSection={<CheckCircleIcon size={14} />}
            onClick={() => approve()}
            loading={isApproving}
            variant="light"
            color="teal"
            size="sm"
          >
            Approve
          </Button>
        )}
      </Group>

      <Tabs defaultValue={item.platform}>
        <Tabs.List>
          <Tabs.Tab value={item.platform} tt="capitalize">
            {item.platform}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value={item.platform} pt="sm">
          <Image
            src={item.previewUrl}
            alt="Content preview"
            radius="md"
            maw={600}
            fallbackSrc="https://placehold.co/600x400?text=No+Preview"
          />
        </Tabs.Panel>
      </Tabs>

      <Divider />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Slot Values
        </Text>
        <Table striped withTableBorder withColumnBorders fz="xs" maw={600}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Slot</Table.Th>
              <Table.Th>Value</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Object.entries(item.slotValues as Record<string, string>).map(
              ([key, val]) => (
                <Table.Tr key={key}>
                  <Table.Td>
                    <Text size="xs" c="dimmed" ff="monospace">
                      {key}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{val}</Text>
                  </Table.Td>
                </Table.Tr>
              ),
            )}
          </Table.Tbody>
        </Table>
      </Stack>

      <Divider />

      <Stack gap="xs">
        <Text size="sm" fw={500}>
          Source Run
        </Text>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            Run ID: {item.runId}
          </Text>
          <Anchor
            size="xs"
            onClick={() =>
              router.push(`/admin/automation/workflows/${item.automationId}`)
            }
          >
            View run history →
          </Anchor>
        </Group>
      </Stack>
    </Stack>
  );
}
