"use client";

import { useState } from "react";
import { Card, Image, Stack, Group, Text, Badge, Menu, ActionIcon, Modal, Button, Alert } from "@zetsel/ui";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { PencilIcon } from "@phosphor-icons/react/dist/csr/Pencil";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  deleteTemplate,
  duplicateTemplate,
  fetchAutomationsForTemplate,
  PLATFORM_LABELS,
  type Template,
} from "../../../../module.api";

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: referencingAutomations } = useQuery({
    queryKey: ["template-automations", template.id],
    queryFn: () => fetchAutomationsForTemplate(template.id),
    enabled: showDeleteModal,
  });

  const activeAutomations = referencingAutomations?.filter(
    (a) => a.status === "running" || a.status === "scheduled"
  ) ?? [];
  const canDelete = !showDeleteModal || activeAutomations.length === 0;

  const { mutate: doDelete, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteTemplate(template.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      setShowDeleteModal(false);
    },
  });

  const { mutate: doDuplicate, isPending: isDuplicating } = useMutation({
    mutationFn: () => duplicateTemplate(template.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  const updatedAt = new Date(template.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <Card withBorder radius="md" padding="sm">
        <Card.Section>
          <Image
            src={template.thumbnailUrl}
            alt={template.name}
            height={140}
            fallbackSrc="https://placehold.co/400x300?text=Template"
          />
        </Card.Section>

        <Stack gap={6} mt="sm">
          <Group justify="space-between" align="flex-start" gap="xs">
            <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate>
                {template.name}
              </Text>
              <Group gap="xs">
                <Badge size="xs" variant="outline">
                  {PLATFORM_LABELS[template.platform]}
                </Badge>
                <Text size="xs" c="dimmed">
                  {template.slots.length} slot{template.slots.length !== 1 ? "s" : ""}
                </Text>
              </Group>
            </Stack>

            <Menu withArrow position="bottom-end" width={160}>
              <Menu.Target>
                <ActionIcon size="sm" variant="subtle" aria-label="Template actions">
                  <DotsThreeIcon size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<PencilIcon size={13} />}
                  onClick={() => router.push(`/admin/automation/templates/${template.id}/edit`)}
                >
                  Edit
                </Menu.Item>
                <Menu.Item
                  leftSection={<EyeIcon size={13} />}
                  onClick={() => router.push(`/admin/automation/templates/${template.id}/preview`)}
                >
                  Preview
                </Menu.Item>
                <Menu.Item
                  leftSection={<CopyIcon size={13} />}
                  onClick={() => doDuplicate()}
                  disabled={isDuplicating}
                >
                  Duplicate
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<TrashIcon size={13} />}
                  color="red"
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>

          <Text size="xs" c="dimmed">
            Updated {updatedAt}
          </Text>
        </Stack>
      </Card>

      <Modal
        opened={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete template"
        size="sm"
      >
        <Stack gap="sm">
          {activeAutomations.length > 0 ? (
            <Alert icon={<WarningIcon size={16} />} color="red" title="Deletion blocked">
              This template is used by {activeAutomations.length} active automation
              {activeAutomations.length > 1 ? "s" : ""}:{" "}
              {activeAutomations.map((a) => a.name).join(", ")}. Pause or delete those automations
              before deleting this template.
            </Alert>
          ) : (
            <>
              <Text size="sm">
                Delete <strong>{template.name}</strong>?
                {referencingAutomations && referencingAutomations.length > 0 && (
                  <> This template is referenced by{" "}
                    {referencingAutomations.map((a) => a.name).join(", ")} but those automations are
                    not currently active.</>
                )}
              </Text>
              <Group gap="xs" justify="flex-end">
                <Button size="xs" variant="subtle" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button size="xs" color="red" onClick={() => doDelete()} loading={isDeleting}>
                  Delete
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </>
  );
}
