"use client";

import { useState } from "react";
import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  SimpleGrid,
  Select,
  Center,
  Loader,
  ScrollArea,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { LayoutIcon } from "@phosphor-icons/react/dist/csr/Layout";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TemplateCard } from "./components/TemplateCard";
import { fetchTemplates, PLATFORM_LABELS, type Template } from "../../module.api";
import type { PlatformFormat } from "../../module.api";

type SortOption = "newest" | "oldest" | "name";

export function TemplatesList() {
  const router = useRouter();
  const [platformFilter, setPlatformFilter] = useState<PlatformFormat | "">("");
  const [sort, setSort] = useState<SortOption>("newest");

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  const templates = data?.data ?? [];

  const filtered = templates
    .filter((t) => !platformFilter || t.platform === platformFilter)
    .sort((a, b) => {
      if (sort === "newest") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      if (sort === "oldest") return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return a.name.localeCompare(b.name);
    });

  return (
    <Paper p={0} withBorder radius="lg" h="calc(100vh - 16px)" style={{ overflow: "hidden" }}>
      <Stack gap={0} h="100%">
        <Group
          p="lg"
          pb="md"
          justify="space-between"
          style={{ borderBottom: "1px solid var(--mantine-color-default-border)", flexShrink: 0 }}
        >
          <Stack gap={2}>
            <Text size="lg" fw={600}>
              Templates
            </Text>
            <Text size="sm" c="dimmed">
              Visual HTML layouts for AI-generated posts
            </Text>
          </Stack>
          <Button
            size="sm"
            leftSection={<PlusIcon size={14} />}
            onClick={() => router.push("/admin/content/templates/new")}
          >
            New Template
          </Button>
        </Group>

        <Group px="lg" py="sm" gap="sm" style={{ flexShrink: 0 }}>
          <Select
            placeholder="All platforms"
            value={platformFilter || null}
            onChange={(v) => setPlatformFilter((v as PlatformFormat) ?? "")}
            clearable
            data={Object.entries(PLATFORM_LABELS).map(([value, label]) => ({ value, label }))}
            size="xs"
            w={160}
          />
          <Select
            value={sort}
            onChange={(v) => setSort((v as SortOption) ?? "newest")}
            data={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name", label: "Name A–Z" },
            ]}
            size="xs"
            w={140}
          />
        </Group>

        <ScrollArea style={{ flex: 1 }} p="lg" pt={0}>
          {isLoading && (
            <Center py="xl">
              <Loader size="sm" />
            </Center>
          )}

          {!isLoading && filtered.length === 0 && templates.length === 0 && (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <LayoutIcon size={40} color="var(--mantine-color-dimmed)" />
                <Text fw={500} c="dimmed">
                  No templates yet
                </Text>
                <Text size="sm" c="dimmed" ta="center" maw={380}>
                  Templates are visual HTML layouts that define named slots. The AI agent fills
                  those slots with real content when running an automation.
                </Text>
                <Button
                  size="sm"
                  mt="xs"
                  leftSection={<PlusIcon size={14} />}
                  onClick={() => router.push("/admin/content/templates/new")}
                >
                  Create your first template
                </Button>
              </Stack>
            </Center>
          )}

          {!isLoading && filtered.length === 0 && templates.length > 0 && (
            <Center py="xl">
              <Text size="sm" c="dimmed">
                No templates match the selected filters.
              </Text>
            </Center>
          )}

          {!isLoading && filtered.length > 0 && (
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} pt="sm">
              {filtered.map((t) => (
                <TemplateCard key={t.id} template={t} />
              ))}
            </SimpleGrid>
          )}
        </ScrollArea>
      </Stack>
    </Paper>
  );
}
