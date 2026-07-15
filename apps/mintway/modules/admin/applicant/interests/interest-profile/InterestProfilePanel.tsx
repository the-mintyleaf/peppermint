"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ModalPaper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  modals,
  useQuery,
} from "@peppermint/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import { interestProfileKeys, useApplicantMutation } from "../../_shared";
import type { InterestProfile } from "../../_shared";
import { InterestProfileForm } from "./InterestProfileForm";
import type { InterestProfilePayload } from "./InterestProfileForm.types";
import {
  createInterestProfile,
  deleteInterestProfile,
  getInterestProfile,
  updateInterestProfile,
} from "./interestProfile.api";

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm">{value || "—"}</Text>
    </Stack>
  );
}

function Tags({ label, items }: { label: string; items?: string[] }) {
  return (
    <Stack gap={4}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      {items && items.length ? (
        <Group gap={4}>
          {items.map((i) => (
            <Badge key={i} variant="light" color="blue" size="sm">
              {i}
            </Badge>
          ))}
        </Group>
      ) : (
        <Text size="sm">—</Text>
      )}
    </Stack>
  );
}

/**
 * The applicant's OneToOne interest profile (§6): create when unset, otherwise view with
 * edit + delete. One profile per applicant, so there's no table — a single record.
 */
export function InterestProfilePanel({ applicantId }: { applicantId: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const invalidateKeys = [interestProfileKeys.detail(applicantId)];

  const query = useQuery({
    queryKey: interestProfileKeys.detail(applicantId),
    queryFn: () => getInterestProfile(applicantId),
    retry: false,
  });
  const profile = query.data ?? null;

  const create = useApplicantMutation<InterestProfile, InterestProfilePayload>({
    mutationFn: (body) => createInterestProfile(applicantId, body),
    successTitle: "Interest profile created",
    successMessage: "The migration preferences were saved.",
    errorTitle: "Couldn't save interest profile",
    invalidateKeys,
  });

  const update = useApplicantMutation<InterestProfile, InterestProfilePayload>({
    mutationFn: (body) => updateInterestProfile(applicantId, body),
    successTitle: "Interest profile updated",
    successMessage: "Your changes were saved.",
    errorTitle: "Couldn't save interest profile",
    invalidateKeys,
    onSuccess: () => setEditOpen(false),
  });

  const remove = useApplicantMutation<void, void>({
    mutationFn: () => deleteInterestProfile(applicantId),
    successTitle: "Interest profile removed",
    successMessage: "The interest profile was deleted.",
    errorTitle: "Couldn't remove interest profile",
    invalidateKeys,
  });

  const confirmDelete = () =>
    modals.openConfirmModal({
      title: "Remove interest profile",
      children: (
        <Text size="sm">Delete this applicant&apos;s interest profile?</Text>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red", size: "xs" },
      cancelProps: { size: "xs" },
      onConfirm: () => remove.mutate(),
    });

  if (query.isLoading) {
    return (
      <ModalPaper withBorder>
        <Center mih={160}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (!profile) {
    return (
      <ModalPaper withBorder>
        <Stack gap="sm">
          <Title order={6}>Interest profile</Title>
          <Text size="sm" c="dimmed">
            No interest profile yet. Capture the applicant&apos;s migration
            preferences.
          </Text>
          <InterestProfileForm
            onSubmit={(body) => create.mutate(body)}
            isLoading={create.isPending}
          />
        </Stack>
      </ModalPaper>
    );
  }

  return (
    <ModalPaper withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Title order={6}>Interest profile</Title>
          <Group gap="xs">
            <Button
              size="xs"
              variant="default"
              leftSection={<PencilSimpleIcon size={14} />}
              onClick={() => setEditOpen(true)}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="light"
              color="red"
              leftSection={<TrashIcon size={14} />}
              onClick={confirmDelete}
            >
              Remove
            </Button>
          </Group>
        </Group>

        <Tags label="Preferred countries" items={profile.preferred_countries} />
        <Tags
          label="Preferred study levels"
          items={profile.preferred_study_levels}
        />
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
          <Field label="Preferred intake" value={profile.preferred_intake} />
          <Field label="Preferred year" value={profile.preferred_year} />
          <Field label="Target program" value={profile.target_program} />
          <Field
            label="Estimated budget"
            value={
              profile.estimated_budget
                ? `${profile.estimated_budget} ${profile.budget_currency ?? ""}`.trim()
                : undefined
            }
          />
          <Field label="Funding method" value={profile.funding_method} />
        </SimpleGrid>
        <Field label="Interests" value={profile.interests} />
        <Field
          label="Qualification summary"
          value={profile.qualification_summary}
        />
      </Stack>

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit interest profile"
        size="lg"
      >
        <InterestProfileForm
          initialValues={profile}
          onSubmit={(body) => update.mutate(body)}
          isLoading={update.isPending}
        />
      </Modal>
    </ModalPaper>
  );
}
