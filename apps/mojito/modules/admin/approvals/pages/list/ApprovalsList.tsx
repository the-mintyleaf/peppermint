"use client";

import {
  Paper,
  Stack,
  Group,
  Text,
  Button,
  Badge,
  Skeleton,
  Center,
  Pagination,
  Collapse,
  ActionIcon,
} from "@peppermint/ui";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { useState } from "react";
import {
  useApprovals,
  useApproveItem,
  useRejectItem,
} from "../../approvals.hooks";
import { RejectModal } from "../../components/RejectModal/RejectModal";
import type { ContentItem } from "@/modules/admin/shared/domain.types";
import { ModulePageShell } from "@/modules/admin/shared/ModulePageShell";

const BASE_PATH = "/admin/publish/approvals";
const MODULE_INFO = { name: "approvals", label: "Approvals" };

function ApprovalRow({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const approve = useApproveItem();
  const reject = useRejectItem();

  return (
    <Paper withBorder radius="sm" p="md">
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
            <ActionIcon
              size="xs"
              variant="subtle"
              onClick={() => setExpanded((e) => !e)}
              aria-label="Toggle preview"
            >
              {expanded ? (
                <CaretUpIcon size={12} />
              ) : (
                <CaretDownIcon size={12} />
              )}
            </ActionIcon>
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} lineClamp={1}>
                {item.title}
              </Text>
              <Group gap={4}>
                {item.variants.slice(0, 4).map((v) => (
                  <Badge key={v.platform} size="xs" variant="dot">
                    {v.platform}
                  </Badge>
                ))}
              </Group>
            </Stack>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            <Button
              size="xs"
              color="green"
              leftSection={<CheckIcon size={12} />}
              loading={approve.isPending}
              onClick={() => approve.mutate({ id: item.id })}
            >
              Approve
            </Button>
            <Button
              size="xs"
              color="red"
              variant="light"
              leftSection={<XIcon size={12} />}
              onClick={() => setRejectOpen(true)}
            >
              Reject
            </Button>
          </Group>
        </Group>

        <Collapse in={expanded}>
          <Stack gap="xs" pt="xs">
            {item.variants.map((v) => (
              <Paper key={v.platform} withBorder radius="xs" p="xs" bg="gray.0">
                <Group justify="space-between" mb={4}>
                  <Badge size="xs">{v.platform}</Badge>
                  <Badge size="xs" variant="light">
                    {v.format}
                  </Badge>
                </Group>
                <Text size="xs" lineClamp={3}>
                  {v.caption}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Collapse>
      </Stack>

      <RejectModal
        opened={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(notes) => {
          reject.mutate({ id: item.id, notes });
          setRejectOpen(false);
        }}
        loading={reject.isPending}
      />
    </Paper>
  );
}

export function ApprovalsList() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useApprovals(page, 20);

  const items = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <ModulePageShell
      basePath={BASE_PATH}
      moduleInfo={MODULE_INFO}
      disableCreateButton
      actions={
        total > 0 ? (
          <Badge size="lg" color="yellow">
            {total} pending
          </Badge>
        ) : undefined
      }
    >
      <Stack
        gap="md"
        style={{ height: "calc(100vh - 160px)", overflow: "auto" }}
      >
        {isLoading && (
          <Stack gap="xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} h={72} radius="sm" />
            ))}
          </Stack>
        )}

        {isError && (
          <Center py="xl">
            <Text c="red" size="sm">
              Failed to load approvals
            </Text>
          </Center>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Center py="xl">
            <Stack align="center" gap="xs">
              <CheckIcon size={32} />
              <Text size="sm" c="dimmed">
                All caught up — no pending approvals
              </Text>
            </Stack>
          </Center>
        )}

        {!isLoading &&
          items.map((item: ContentItem) => (
            <ApprovalRow key={item.id} item={item} />
          ))}

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
            />
          </Group>
        )}
      </Stack>
    </ModulePageShell>
  );
}
