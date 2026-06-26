"use client";

import {
  Stack,
  Text,
  Group,
  Paper,
  Image,
  SegmentedControl,
  Avatar,
  Badge,
} from "@peppermint/ui";
import { useComposeStore } from "../../compose.store";
import { PLATFORM_LABELS } from "../../compose.types";
import type { Platform } from "@/modules/admin/shared/domain.types";

const PREVIEW_PLATFORMS: Platform[] = ["instagram", "x", "linkedin", "tiktok"];

function InstagramPreview({
  caption,
  imageUrl,
}: {
  caption: string;
  imageUrl?: string;
}) {
  return (
    <Paper withBorder radius="md" style={{ width: 280, overflow: "hidden" }}>
      <Stack gap={0}>
        <Group p="xs" gap="xs">
          <Avatar size="sm" color="grape" radius="xl">
            M
          </Avatar>
          <Text size="xs" fw={600}>
            mojito_brand
          </Text>
        </Group>
        {imageUrl && (
          <Image src={imageUrl} alt="Post preview" h={280} fit="cover" />
        )}
        {!imageUrl && (
          <Paper
            h={280}
            bg="gray.1"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text size="xs" c="dimmed">
              No media selected
            </Text>
          </Paper>
        )}
        <Stack gap={4} p="xs">
          <Text size="xs" lineClamp={3}>
            {caption || "Caption will appear here…"}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}

function XPreview({ caption }: { caption: string }) {
  return (
    <Paper withBorder radius="md" p="sm" style={{ width: 280 }}>
      <Group gap="xs" align="flex-start">
        <Avatar size="sm" color="dark" radius="xl">
          M
        </Avatar>
        <Stack gap={2} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text size="xs" fw={600}>
              Mojito
            </Text>
            <Text size="xs" c="dimmed">
              @mojito_brand
            </Text>
          </Group>
          <Text size="xs" lineClamp={5}>
            {caption || "Tweet content here…"}
          </Text>
          {caption.length > 280 && (
            <Badge size="xs" color="red">
              Over 280 character limit
            </Badge>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

function LinkedInPreview({ caption }: { caption: string }) {
  return (
    <Paper withBorder radius="md" p="sm" style={{ width: 280 }}>
      <Group gap="xs" align="flex-start" mb="xs">
        <Avatar size="sm" color="indigo" radius="xl">
          M
        </Avatar>
        <Stack gap={0}>
          <Text size="xs" fw={600}>
            Mojito Company
          </Text>
          <Text size="xs" c="dimmed">
            Company · 1,800 followers
          </Text>
        </Stack>
      </Group>
      <Text size="xs" lineClamp={6}>
        {caption || "Post content here…"}
      </Text>
    </Paper>
  );
}

function TikTokPreview({
  caption,
  imageUrl,
}: {
  caption: string;
  imageUrl?: string;
}) {
  return (
    <Paper
      withBorder
      radius="md"
      style={{ width: 160, overflow: "hidden", position: "relative" }}
    >
      {imageUrl ? (
        <Image src={imageUrl} alt="TikTok preview" h={280} fit="cover" />
      ) : (
        <Paper
          h={280}
          bg="dark.8"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text size="xs" c="dimmed">
            No video
          </Text>
        </Paper>
      )}
      <Paper
        p="xs"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
        }}
      >
        <Text size="xs" c="white" lineClamp={2}>
          {caption}
        </Text>
      </Paper>
    </Paper>
  );
}

export function PlatformPreview() {
  const { draft, previewPlatform, setPreview } = useComposeStore();
  const caption = draft.globalCaption;
  const firstMedia = draft.mediaRefs[0];

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        Preview
      </Text>
      <SegmentedControl
        size="xs"
        value={previewPlatform}
        onChange={(v) => setPreview(v as Platform)}
        data={PREVIEW_PLATFORMS.map((p) => ({
          value: p,
          label: PLATFORM_LABELS[p].split(" ")[0],
        }))}
      />
      <Stack align="center" pt="xs">
        {previewPlatform === "instagram" && (
          <InstagramPreview caption={caption} imageUrl={firstMedia?.url} />
        )}
        {previewPlatform === "x" && <XPreview caption={caption} />}
        {previewPlatform === "linkedin" && (
          <LinkedInPreview caption={caption} />
        )}
        {previewPlatform === "tiktok" && (
          <TikTokPreview caption={caption} imageUrl={firstMedia?.url} />
        )}
      </Stack>
    </Stack>
  );
}
