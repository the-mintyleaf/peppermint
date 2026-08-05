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
import { RequireCapability } from "@/components/RequireCapability";
import { getApiError } from "@/lib/authErrorMessages";
import { useCurrentUser } from "@/modules/admin/authenticate/_shared/useCurrentUser";
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
  const { authorityType } = useCurrentUser();
  const isAdmin = authorityType === "admin";
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

  const canPublish = isAdmin && template.status === "draft";
  const canRetire = isAdmin && template.status === "active";

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
          </Group>

          {template.description ? (
            <Text size="sm">{template.description}</Text>
          ) : null}

          <Text size="sm" fw={500}>
            Requirements
          </Text>
          <TemplateItemsList template={template} isAdmin={isAdmin} />
        </Stack>
      </ModalPaper>

      {isAdmin ? (
        <AddTemplateItemModal
          templateId={template.id}
          opened={addItemOpen}
          onClose={() => setAddItemOpen(false)}
        />
      ) : null}
    </>
  );
}

/**
 * Admin-only at the screen level. The backend grants `lead_manager` reads (§1) and
 * the inline write gates below still exist for that reason, but template authoring
 * is not staff work, so the `checklists` capability gates the route outright.
 */
export function ModuleTemplateDetail() {
  return (
    <RequireCapability capability="checklists">
      <TemplateDetailContent />
    </RequireCapability>
  );
}
