"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Paper, SimpleGrid, Stack, Group, Text, Pagination, Center, Loader } from "@zetsel/ui";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "./components/ContentCard";
import { ContentFilters } from "./components/ContentFilters";
import { fetchContentList, type ContentFilter } from "../../module.api";

const PAGE_SIZE = 24;

function filterFromParams(params: URLSearchParams): ContentFilter {
  return {
    platform: params.get("platform") ?? undefined,
    status: params.get("status") ?? undefined,
    automationId: params.get("automation_id") ?? undefined,
    page: Number(params.get("page") ?? 1),
    limit: PAGE_SIZE,
  };
}

function filterToParams(filter: ContentFilter): URLSearchParams {
  const params = new URLSearchParams();
  if (filter.platform) params.set("platform", filter.platform);
  if (filter.status) params.set("status", filter.status);
  if (filter.automationId) params.set("automation_id", filter.automationId);
  if (filter.page && filter.page > 1) params.set("page", String(filter.page));
  return params;
}

export function ContentLibraryList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [filter, setFilter] = useState<ContentFilter>(() =>
    filterFromParams(searchParams)
  );

  useEffect(() => {
    const params = filterToParams(filter);
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/admin/content/library", { scroll: false });
  }, [filter, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["content-library", "list", filter],
    queryFn: () => fetchContentList(filter),
  });

  const totalPages = data ? Math.ceil(data.meta.total / PAGE_SIZE) : 1;
  const hasData = !!data && data.meta.total > 0;
  const hasResults = !!data && data.data.length > 0;
  const isFiltered = !!(filter.platform || filter.status || filter.automationId);

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <Stack gap={0} h="100%">
        <Stack gap="sm" p="lg" pb="md" style={{ borderBottom: "1px solid var(--mantine-color-default-border)" }}>
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="lg" fw={600}>
                Content Library
              </Text>
              <Text size="sm" c="dimmed">
                Everything the AI agent has generated
              </Text>
            </Stack>
            {data && (
              <Text size="sm" c="dimmed">
                {data.meta.total} items
              </Text>
            )}
          </Group>
          <ContentFilters filter={filter} onChange={setFilter} />
        </Stack>

        <Stack gap="lg" p="lg" style={{ flex: 1, overflowY: "auto" }}>
          {isLoading && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {!isLoading && !hasData && (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  Nothing generated yet
                </Text>
                <Text size="xs" c="dimmed" ta="center" maw={360}>
                  Once your automations run, generated content will appear here for review.
                </Text>
              </Stack>
            </Center>
          )}

          {!isLoading && hasData && !hasResults && isFiltered && (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <Text size="sm" fw={500} c="dimmed">
                  No results match these filters
                </Text>
                <Text size="xs" c="dimmed">
                  Try adjusting or clearing your filters.
                </Text>
              </Stack>
            </Center>
          )}

          {!isLoading && hasResults && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}>
              {data.data.map((item) => (
                <ContentCard key={item.id} item={item} />
              ))}
            </SimpleGrid>
          )}

          {totalPages > 1 && (
            <Center>
              <Pagination
                value={filter.page ?? 1}
                onChange={(p) => setFilter((f) => ({ ...f, page: p }))}
                total={totalPages}
                size="sm"
              />
            </Center>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
