"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  Badge,
  Select,
  TextInput,
  Skeleton,
  Avatar,
  Anchor,
  Pagination,
  Center,
} from "@zetsel/ui";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { useState } from "react";
import { useMentions } from "../../listening.hooks";
import type { MentionFilters } from "../../listening.api";
import type { Mention } from "../../../shared/entities.types";

const SENTIMENT_COLOR: Record<Mention["sentiment"], string> = {
  positive: "green",
  neutral: "gray",
  negative: "red",
};

export function MentionsFeed() {
  const [filters, setFilters] = useState<MentionFilters>({ page: 1, pageSize: 15 });
  const { data, isLoading } = useMentions(filters);

  const mentions = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const pageCount = Math.ceil(total / (filters.pageSize ?? 15));

  function update(patch: Partial<MentionFilters>) {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Title order={3}>Mentions</Title>
            <Text c="dimmed" size="sm">Track who's talking about your brand across platforms</Text>
          </Stack>
          {total > 0 && <Badge size="sm" color="blue">{total} mentions</Badge>}
        </Group>
      </Paper>

      <Paper withBorder radius="md" p="sm">
        <Group gap="sm">
          <TextInput
            style={{ flex: 1 }}
            size="xs"
            placeholder="Search mentions…"
            leftSection={<MagnifyingGlassIcon size={14} />}
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.currentTarget.value || undefined })}
          />
          <Select
            size="xs"
            w={130}
            placeholder="Sentiment"
            clearable
            data={[
              { label: "Positive", value: "positive" },
              { label: "Neutral", value: "neutral" },
              { label: "Negative", value: "negative" },
            ]}
            value={filters.sentiment ?? null}
            onChange={(v) => update({ sentiment: (v as Mention["sentiment"]) ?? undefined })}
          />
          <Select
            size="xs"
            w={130}
            placeholder="Platform"
            clearable
            data={["instagram", "x", "linkedin", "tiktok", "facebook"].map((p) => ({
              label: p.charAt(0).toUpperCase() + p.slice(1),
              value: p,
            }))}
            value={filters.platform ?? null}
            onChange={(v) => update({ platform: v ?? undefined })}
          />
        </Group>
      </Paper>

      {isLoading ? (
        <Stack gap="sm">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={80} radius="md" />)}
        </Stack>
      ) : mentions.length === 0 ? (
        <Center py="xl">
          <Text c="dimmed" size="sm">No mentions found</Text>
        </Center>
      ) : (
        <Stack gap="sm">
          {mentions.map((m) => (
            <Paper key={m.id} withBorder radius="md" p="md">
              <Group gap="md" wrap="nowrap" align="flex-start">
                <Avatar size="sm" radius="xl" color="blue">
                  {m.author.charAt(0).toUpperCase()}
                </Avatar>
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs">
                      <Text size="sm" fw={600}>{m.author}</Text>
                      <Badge size="xs" variant="light">{m.platform}</Badge>
                      <Badge size="xs" color={SENTIMENT_COLOR[m.sentiment]} variant="light">
                        {m.sentiment}
                      </Badge>
                    </Group>
                    <Group gap="xs">
                      <Text size="xs" c="dimmed">{m.reach.toLocaleString()} reach</Text>
                      <Anchor href={m.url} target="_blank" size="xs" c="dimmed" aria-label="Open mention">
                        <ArrowSquareOutIcon size={12} />
                      </Anchor>
                    </Group>
                  </Group>
                  <Text size="sm">{m.text}</Text>
                  <Text size="xs" c="dimmed">{m.createdAt.toLocaleString()}</Text>
                </Stack>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {pageCount > 1 && (
        <Pagination
          size="sm"
          total={pageCount}
          value={filters.page ?? 1}
          onChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        />
      )}
    </Stack>
  );
}
