"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { QueryErrorState } from "@/components/QueryErrorState";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
import { useTemplateDetail, useUpdateTemplate } from "../../checklists.hooks";
import {
  TEMPLATE_STATUS_COLORS,
  TEMPLATE_STATUS_LABELS,
} from "../../checklists.labels";
import { AddTemplateItemModal } from "./components/AddTemplateItemModal";
import { TemplateItemsList } from "./components/TemplateItemsList";

/**
 * A workflow template worked in place — the same header, lifecycle actions and
 * requirement rows the route used to carry, on the drawer surface instead. The
 * write gates stay Admin-only (§1): the backend grants a `lead_manager` reads,
 * so the controls hide rather than 403.
 */
export function TemplateProfilePanel({ templateId }: { templateId: string }) {
  const [addItemOpen, setAddItemOpen] = useState(false);
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
  const {
    data: template,
    isLoading,
    isError,
    refetch,
  } = useTemplateDetail(templateId);
  const updateTemplate = useUpdateTemplate(templateId);

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" aria-label="Loading template" />
      </Center>
    );
  }

  if (isError || !template) {
    return (
      <QueryErrorState
        message="Couldn't load this template."
        onRetry={() => refetch()}
      />
    );
  }

  const canPublish = isAdmin && template.status === "draft";
  const canRetire = isAdmin && template.status === "active";

  return (
    <Stack gap="md">
      <Stack gap={4}>
        <Group gap="xs" wrap="nowrap">
          <Title order={4} style={{ minWidth: 0 }}>
            {template.label}
          </Title>
          <Badge
            size="sm"
            variant="light"
            color={TEMPLATE_STATUS_COLORS[template.status]}
          >
            {TEMPLATE_STATUS_LABELS[template.status]}
          </Badge>
          {template.is_default ? (
            <Badge size="sm" variant="outline" color="teal">
              Default
            </Badge>
          ) : null}
        </Group>
        <Text size="xs" c="dimmed">
          {template.country
            ? template.country.name
            : "General — applied only manually"}
        </Text>
      </Stack>

      {template.description ? (
        <Text size="sm">{template.description}</Text>
      ) : null}

      {canPublish || canRetire ? (
        <Group gap="xs">
          {canPublish ? (
            <Button
              size="xs"
              leftSection={<PaperPlaneTiltIcon size={14} aria-hidden />}
              loading={updateTemplate.isPending}
              onClick={() => updateTemplate.mutate({ status: "active" })}
            >
              Publish
            </Button>
          ) : null}
          {canRetire ? (
            <Button
              size="xs"
              variant="default"
              color="red"
              leftSection={<ProhibitIcon size={14} aria-hidden />}
              loading={updateTemplate.isPending}
              onClick={() => updateTemplate.mutate({ status: "inactive" })}
            >
              Retire template
            </Button>
          ) : null}
        </Group>
      ) : null}

      <Group justify="space-between" wrap="nowrap">
        <Text size="sm" fw={600}>
          Requirements
        </Text>
        {isAdmin ? (
          <Button
            size="xs"
            variant="light"
            leftSection={<PlusIcon size={14} aria-hidden />}
            onClick={() => setAddItemOpen(true)}
          >
            Add requirement
          </Button>
        ) : null}
      </Group>

      <TemplateItemsList template={template} isAdmin={isAdmin} />

      {isAdmin ? (
        <AddTemplateItemModal
          templateId={template.id}
          opened={addItemOpen}
          onClose={() => setAddItemOpen(false)}
        />
      ) : null}
    </Stack>
  );
}
