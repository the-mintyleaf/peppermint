"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  Title,
} from "@peppermint/ui";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { RequireDocumentAccess } from "@/components/RequireDocumentAccess";
import { getApiError } from "@/lib/authErrorMessages";
import {
  useTemplateDetail,
  useUpdateTemplate,
} from "../../../checklists.hooks";
import {
  TEMPLATE_STATUS_COLORS,
  TEMPLATE_STATUS_LABELS,
} from "../../../checklists.labels";
import { AddTemplateItemModal } from "./components/AddTemplateItemModal";
import { TemplateItemsList } from "./components/TemplateItemsList";

function TemplateDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [addItemOpen, setAddItemOpen] = useState(false);
  const {
    data: template,
    isLoading,
    isError,
    error,
    refetch,
  } = useTemplateDetail(id);
  const updateTemplate = useUpdateTemplate(id);

  const notFound =
    isError && getApiError(error).code === "CHECKLISTS_TEMPLATE_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Template not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/checklists/templates")}
          >
            Back to templates
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !template) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this template.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const canPublish = template.status === "draft";
  const canRetire = template.status === "active";

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Checklist templates", href: "/admin/checklists/templates" },
          {
            label: template.label,
            href: `/admin/checklists/templates/${template.id}`,
          },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>{template.label}</Title>
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
              <Button
                size="xs"
                variant="light"
                leftSection={<PlusIcon size={14} aria-hidden />}
                onClick={() => setAddItemOpen(true)}
              >
                Add requirement
              </Button>
            </Group>
          </Group>

          {template.description ? (
            <Text size="sm">{template.description}</Text>
          ) : null}

          <Text size="sm" fw={500}>
            Requirements
          </Text>
          <TemplateItemsList template={template} />
        </Stack>
      </ModalPaper>

      <AddTemplateItemModal
        templateId={template.id}
        opened={addItemOpen}
        onClose={() => setAddItemOpen(false)}
      />
    </>
  );
}

/** Authoring is Admin-only (§1) — same exact-admin gate the templates list uses. */
export function ModuleTemplateDetail() {
  return (
    <RequireDocumentAccess>
      <TemplateDetailContent />
    </RequireDocumentAccess>
  );
}
