"use client";

import { Card, Image, Stack, Group, Text, Badge, Anchor } from "@zetsel/ui";
import { useRouter } from "next/navigation";
import type { ContentItem } from "../../../../module.api";

interface ContentCardProps {
  item: ContentItem;
}

const STATUS_COLORS: Record<string, string> = {
  generated: "blue",
  approved: "teal",
  published: "green",
  failed: "red",
};

export function ContentCard({ item }: ContentCardProps) {
  const router = useRouter();
  const generatedAt = new Date(item.generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      withBorder
      radius="md"
      padding="sm"
      style={{ cursor: "pointer" }}
      onClick={() => router.push(`/admin/publish/library/${item.id}`)}
    >
      <Card.Section>
        <Image
          src={item.previewUrl}
          alt={`Preview for ${item.automationName}`}
          height={160}
          fallbackSrc="https://placehold.co/400x300?text=No+Preview"
        />
      </Card.Section>

      <Stack gap={6} mt="sm">
        <Group gap="xs" justify="space-between">
          <Badge size="xs" variant="outline" tt="capitalize">
            {item.platform}
          </Badge>
          <Badge size="xs" color={STATUS_COLORS[item.status] ?? "gray"}>
            {item.status}
          </Badge>
        </Group>

        <Anchor
          size="xs"
          fw={500}
          href={`/admin/automation/workflows/${item.automationId}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/automation/workflows/${item.automationId}`);
          }}
        >
          {item.automationName}
        </Anchor>

        <Anchor
          size="xs"
          c="dimmed"
          href={`/admin/automation/templates/${item.templateId}/preview`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/automation/templates/${item.templateId}/preview`);
          }}
        >
          {item.templateName}
        </Anchor>

        <Text size="xs" c="dimmed">
          {generatedAt}
        </Text>
      </Stack>
    </Card>
  );
}
