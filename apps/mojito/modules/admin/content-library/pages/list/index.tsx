"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SimpleGrid, Stack, Group, Text, Pagination, Center, Loader } from "@peppermint/ui";
import { useQuery } from "@tanstack/react-query";
import { ContentCard } from "./components/ContentCard";
import { ContentFilters } from "./components/ContentFilters";
import { fetchContentList, type ContentFilter } from "../../module.api";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/publish/library";
const MODULE_INFO = { name: "library", label: "Content Library" };

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
    router.replace(qs ? `?${qs}` : "/admin/publish/library", { scroll: false });
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
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        data ? <Text size="sm" c="dimmed">{data.meta.total} items</Text> : undefined
      }
    >
      <Stack gap="md" style={{ height: "calc(100vh - 160px)", overflow: "auto" }}>
        <ContentFilters filter={filter} onChange={setFilter} />
        <Stack gap="lg">
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
    </ModulePageShell>
  );
}
