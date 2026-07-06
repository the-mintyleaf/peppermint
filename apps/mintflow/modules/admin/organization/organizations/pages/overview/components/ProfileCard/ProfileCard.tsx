"use client";

import {
  Button,
  Card,
  Group,
  Modal,
  notifications,
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import { BilingualName } from "../../../../../_shared/components/BilingualName";
import { OrganizationStatusBadge } from "../../../../../_shared/components/OrganizationStatusBadge";
import { EditOrganizationProfileForm } from "../../../../form";
import type { EditOrganizationProfileFormValues } from "../../../../form";
import { updateOrganization } from "../../../../organizations.api";
import { organizationsQueryKeys } from "../../../../organizations.queryKeys";
import type { ProfileCardProps } from "./ProfileCard.types";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value || "—"}</Text>
    </Stack>
  );
}

export function ProfileCard({ organization }: ProfileCardProps) {
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);

  const updateMutation = useMutation({
    mutationFn: (values: EditOrganizationProfileFormValues) =>
      updateOrganization(organization.id, values),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: organizationsQueryKeys.detail(organization.id),
      });
      notifications.show({
        color: "green",
        title: "Profile updated",
        message: "Organization profile changes were saved.",
      });
      close();
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't save changes",
        message: getApiErrorMessage(error),
      });
    },
  });

  return (
    <>
      <Card withBorder padding="md" radius="md">
        <Group justify="space-between" align="flex-start" mb="sm">
          <Group gap="xs" align="center">
            <BilingualName
              np={organization.name_np}
              en={organization.name_en}
              size="lg"
              fw={600}
            />
            <OrganizationStatusBadge status={organization.status} />
          </Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<PencilSimpleIcon size={13} />}
            onClick={open}
          >
            Edit Profile
          </Button>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          <Field label="Code" value={organization.code} />
          <Field label="Type" value={organization.organization_type} />
          <Field
            label="Legal Name (Nepali)"
            value={organization.legal_name_np}
          />
          <Field
            label="Short Name (Nepali)"
            value={organization.short_name_np}
          />
          <Field
            label="Short Name (English)"
            value={organization.short_name_en}
          />
          <Field label="Country Code" value={organization.country_code} />
          <Field label="Timezone" value={organization.timezone} />
        </SimpleGrid>
        {organization.description && (
          <Text size="sm" mt="md" c="dimmed">
            {organization.description}
          </Text>
        )}
      </Card>

      <Modal opened={opened} onClose={close} title="Edit Organization Profile">
        <EditOrganizationProfileForm
          organization={organization}
          onSubmit={(values) => updateMutation.mutate(values)}
          isLoading={updateMutation.isPending}
        />
      </Modal>
    </>
  );
}
