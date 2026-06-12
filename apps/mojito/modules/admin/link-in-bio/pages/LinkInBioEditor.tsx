"use client";

import {
  Stack,
  Group,
  Title,
  Text,
  Paper,
  TextInput,
  Textarea,
  Button,
  Switch,
  ActionIcon,
  Badge,
  Select,
  Skeleton,
  Grid,
  Avatar,
  Anchor,
} from "@zetsel/ui";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { DotsSixVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsSixVertical";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  useLinkInBioPage,
  useUpdateLinkInBioPage,
  useUpdateLinks,
  usePublishLinkInBio,
} from "../linkInBio.hooks";
import type { LinkItem, LinkInBioPage } from "../linkInBio.api";

function MobilePreview({ page }: { page: LinkInBioPage }) {
  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{
        width: 280,
        minHeight: 500,
        background: page.theme === "dark" ? "#1a1a2e" : page.theme === "gradient"
          ? `linear-gradient(135deg, ${page.accentColor}22, #ffffff)`
          : "#ffffff",
        color: page.theme === "dark" ? "#fff" : "#000",
      }}
    >
      <Stack align="center" gap="sm">
        <Avatar src={page.avatarUrl} size="lg" radius="xl" />
        <Stack gap={2} align="center">
          <Text fw={700} size="sm">{page.title}</Text>
          {page.bio && <Text size="xs" c="dimmed" ta="center">{page.bio}</Text>}
        </Stack>
        <Stack gap="xs" w="100%">
          {page.links.filter((l) => l.enabled).map((link) => (
            <Paper
              key={link.id}
              withBorder
              radius="md"
              p="xs"
              style={{
                textAlign: "center",
                borderColor: page.accentColor,
                cursor: "pointer",
              }}
            >
              <Text size="xs" fw={500}>{link.label}</Text>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function LinkInBioEditor() {
  const { data, isLoading } = useLinkInBioPage();
  const updatePage = useUpdateLinkInBioPage();
  const updateLinks = useUpdateLinks();
  const publish = usePublishLinkInBio();

  const [pageDraft, setPageDraft] = useState<Partial<LinkInBioPage>>({});
  const [links, setLinks] = useState<LinkItem[]>([]);

  useEffect(() => {
    if (data) {
      setPageDraft(data);
      setLinks([...data.links]);
    }
  }, [data]);

  async function handleSave() {
    const { links: _, ...rest } = pageDraft as LinkInBioPage;
    await Promise.all([
      updatePage.mutateAsync(rest),
      updateLinks.mutateAsync(links),
    ]);
    notifications.show({ message: "Changes saved", color: "green" });
  }

  async function handlePublish() {
    await publish.mutateAsync();
    notifications.show({ message: "Page published!", color: "green" });
  }

  function addLink() {
    const newLink: LinkItem = {
      id: `lnk_${Date.now()}`,
      label: "New Link",
      url: "",
      enabled: true,
      order: links.length,
    };
    setLinks((prev) => [...prev, newLink]);
  }

  function removeLink(id: string) {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  function updateLink(id: string, patch: Partial<LinkItem>) {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  if (isLoading) {
    return <Stack gap="md">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={120} radius="md" />)}</Stack>;
  }

  return (
    <Stack gap="md">
      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <Title order={3}>Link in Bio</Title>
              {data?.publishedAt && (
                <Badge size="xs" color="green" variant="light">Published</Badge>
              )}
            </Group>
            <Text c="dimmed" size="sm">
              Build and manage your link page — live at{" "}
              <Anchor href={`https://ztsl.co/${data?.slug}`} target="_blank" size="sm">
                ztsl.co/{data?.slug} <ArrowSquareOutIcon size={12} />
              </Anchor>
            </Text>
          </Stack>
          <Group gap="sm">
            <Button size="sm" variant="light" loading={updatePage.isPending || updateLinks.isPending} onClick={handleSave}>
              Save Draft
            </Button>
            <Button size="sm" loading={publish.isPending} onClick={handlePublish}>
              Publish
            </Button>
          </Group>
        </Group>
      </Paper>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="md">
            <Paper withBorder radius="md" p="md">
              <Title order={5} mb="md">Page Settings</Title>
              <Stack gap="sm">
                <TextInput
                  label="Display Name"
                  size="sm"
                  value={pageDraft.title ?? ""}
                  onChange={(e) => setPageDraft((d) => ({ ...d, title: e.currentTarget.value }))}
                />
                <Textarea
                  label="Bio"
                  size="sm"
                  autosize
                  minRows={2}
                  placeholder="Short bio or tagline…"
                  value={pageDraft.bio ?? ""}
                  onChange={(e) => setPageDraft((d) => ({ ...d, bio: e.currentTarget.value }))}
                />
                <TextInput
                  label="Slug"
                  size="sm"
                  placeholder="yourbrand"
                  value={pageDraft.slug ?? ""}
                  onChange={(e) => setPageDraft((d) => ({ ...d, slug: e.currentTarget.value }))}
                />
                <Select
                  label="Theme"
                  size="sm"
                  data={[
                    { label: "Light", value: "light" },
                    { label: "Dark", value: "dark" },
                    { label: "Gradient", value: "gradient" },
                  ]}
                  value={pageDraft.theme ?? "light"}
                  onChange={(v) => setPageDraft((d) => ({ ...d, theme: (v as LinkInBioPage["theme"]) ?? "light" }))}
                />
                <TextInput
                  label="Accent Color"
                  size="sm"
                  placeholder="#228be6"
                  value={pageDraft.accentColor ?? ""}
                  onChange={(e) => setPageDraft((d) => ({ ...d, accentColor: e.currentTarget.value }))}
                />
              </Stack>
            </Paper>

            <Paper withBorder radius="md" p="md">
              <Group justify="space-between" mb="md">
                <Title order={5}>Links</Title>
                <Button size="xs" variant="light" leftSection={<PlusIcon size={12} />} onClick={addLink}>
                  Add Link
                </Button>
              </Group>
              <Stack gap="sm">
                {links.map((link) => (
                  <Paper key={link.id} withBorder radius="sm" p="sm">
                    <Group gap="sm" wrap="nowrap">
                      <ActionIcon size="sm" variant="subtle" style={{ cursor: "grab" }} aria-label="Drag to reorder">
                        <DotsSixVerticalIcon size={14} />
                      </ActionIcon>
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <TextInput
                          size="xs"
                          placeholder="Link label"
                          value={link.label}
                          onChange={(e) => updateLink(link.id, { label: e.currentTarget.value })}
                        />
                        <TextInput
                          size="xs"
                          placeholder="https://…"
                          value={link.url}
                          onChange={(e) => updateLink(link.id, { url: e.currentTarget.value })}
                        />
                      </Stack>
                      <Switch
                        size="sm"
                        checked={link.enabled}
                        onChange={(e) => updateLink(link.id, { enabled: e.currentTarget.checked })}
                        aria-label="Enable link"
                      />
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="red"
                        onClick={() => removeLink(link.id)}
                        aria-label="Remove link"
                      >
                        <TrashIcon size={12} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                ))}
                {links.length === 0 && (
                  <Text size="xs" c="dimmed" ta="center" py="md">No links yet — add one above</Text>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Paper withBorder radius="md" p="md">
            <Text fw={500} size="sm" mb="md">Preview</Text>
            <Stack align="center">
              {pageDraft.title !== undefined && (
                <MobilePreview page={{ ...data!, ...pageDraft, links }} />
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
