"use client";

import { Drawer, Stack, Group, Text, Badge, Tabs, Image, Table, Button, Loader, Center } from "@zetsel/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import type { ContentPreviewDrawerProps } from "./ContentPreviewDrawer.types";

// Inline mock fetch — replaced by real API client when backend is ready
async function fetchContentItem(id: string) {
  await new Promise((r) => setTimeout(r, 400));
  return {
    id,
    automationId: "auto_1",
    automationName: "Weekly Instagram Post",
    templateId: "tmpl_1",
    templateName: "Instagram Square v2",
    platform: "instagram",
    status: "generated" as const,
    generatedAt: new Date(Date.now() - 3600_000).toISOString(),
    publishedAt: undefined,
    previewUrl: "https://placehold.co/600x600?text=Preview",
    slotValues: {
      headline: "Refreshing summer vibes",
      cta: "Shop now",
      product_image: "https://placehold.co/400x400",
    },
    runId: "run_1",
  };
}

async function approveContentItem(id: string) {
  await new Promise((r) => setTimeout(r, 300));
  return { id, status: "approved" };
}

const STATUS_COLORS: Record<string, string> = {
  generated: "blue",
  approved: "teal",
  published: "green",
  failed: "red",
};

export function ContentPreviewDrawer({ contentId, onClose }: ContentPreviewDrawerProps) {
  const queryClient = useQueryClient();

  const { data: item, isLoading } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => fetchContentItem(contentId!),
    enabled: !!contentId,
  });

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approveContentItem(contentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      onClose();
    },
  });

  return (
    <Drawer
      opened={!!contentId}
      onClose={onClose}
      position="right"
      size="md"
      title={item ? item.automationName : "Content Preview"}
      padding="lg"
    >
      {isLoading && (
        <Center h={200}>
          <Loader size="sm" />
        </Center>
      )}

      {item && (
        <Stack gap="md">
          <Group gap="xs">
            <Badge color={STATUS_COLORS[item.status] ?? "gray"} size="sm">
              {item.status}
            </Badge>
            <Text size="xs" c="dimmed">
              {item.templateName}
            </Text>
          </Group>

          <Tabs defaultValue={item.platform}>
            <Tabs.List>
              <Tabs.Tab value={item.platform}>{item.platform}</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value={item.platform} pt="sm">
              <Image
                src={item.previewUrl}
                alt="Content preview"
                radius="md"
                fallbackSrc="https://placehold.co/600x400?text=No+Preview"
              />
            </Tabs.Panel>
          </Tabs>

          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Slot Values
            </Text>
            <Table striped withTableBorder withColumnBorders fz="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Slot</Table.Th>
                  <Table.Th>Value</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {Object.entries(item.slotValues as Record<string, string>).map(([key, val]) => (
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
                ))}
              </Table.Tbody>
            </Table>
          </Stack>

          <Group gap="xs">
            <Button
              component="a"
              href={`/admin/publish/library/${item.id}`}
              variant="subtle"
              size="xs"
            >
              View in Content Library
            </Button>
            <Button
              component="a"
              href={`/admin/automation/workflows/${item.automationId}`}
              variant="subtle"
              size="xs"
            >
              Open Automation
            </Button>
          </Group>

          {item.status === "generated" && (
            <Button
              leftSection={<CheckCircleIcon size={14} />}
              onClick={() => approve()}
              loading={isApproving}
              variant="light"
              color="teal"
            >
              Approve
            </Button>
          )}
        </Stack>
      )}
    </Drawer>
  );
}
