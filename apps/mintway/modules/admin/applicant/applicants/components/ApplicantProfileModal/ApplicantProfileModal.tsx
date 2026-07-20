"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Center,
  Divider,
  Group,
  Loader,
  Modal,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { ClientPreconditionError, getApiError } from "@/lib/authErrorMessages";
import {
  APPLICANT_SECTIONS,
  applicantKeys,
  updateApplicant,
  useApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type { Applicant, ApplicantSectionId } from "../../../_shared";
import { ApplicantActionBar } from "../ApplicantActions/ApplicantActionBar";
import { ApplicantEditForm, toUpdatePayload } from "../../form";
import type { ApplicantFormValues } from "../../form";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileOverview } from "./ProfileOverview";
import { SectionContent } from "./SectionContent";
import type { ApplicantProfileModalProps } from "./ApplicantProfileModal.types";

function ProfileState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Center mih={240}>
      <Stack align="center" gap="xs" maw={360}>
        <ThemeIcon size={44} radius="xl" color="gray" variant="light">
          <WarningCircleIcon size={22} weight="fill" aria-hidden />
        </ThemeIcon>
        <Title order={5} ta="center">
          {title}
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          {description}
        </Text>
        {onRetry && (
          <Button variant="default" size="xs" mt="xs" onClick={onRetry}>
            Try again
          </Button>
        )}
      </Stack>
    </Center>
  );
}

/** Section nav + the active section's content — overview by default, others in-place. */
function ProfileSections({
  applicant,
  isAdmin,
}: {
  applicant: Applicant;
  isAdmin: boolean;
}) {
  const [active, setActive] = useState<ApplicantSectionId>("overview");
  const sections = APPLICANT_SECTIONS.filter((s) => isAdmin || !s.adminOnly);

  return (
    <Stack gap="md">
      <Tabs
        value={active}
        onChange={(v) => v && setActive(v as ApplicantSectionId)}
        variant="outline"
      >
        <Tabs.List>
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Tabs.Tab
                key={section.id}
                value={section.id}
                leftSection={<Icon size={15} aria-hidden />}
              >
                {section.label}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      {active === "overview" ? (
        <ProfileOverview applicant={applicant} isAdmin={isAdmin} />
      ) : (
        <SectionContent
          sectionId={active}
          applicant={applicant}
          isAdmin={isAdmin}
        />
      )}
    </Stack>
  );
}

function ApplicantProfileBody({ applicantId }: { applicantId: string }) {
  const router = useRouter();
  const { applicant, isLoading, isError, error, isAdmin, refetch } =
    useApplicant(applicantId);
  const [editOpen, setEditOpen] = useState(false);

  const editMutation = useApplicantMutation<Applicant, ApplicantFormValues>({
    mutationFn: (values) => {
      // See ApplicantOverview: `0` is a wrong version, not an "unknown" sentinel —
      // it guarantees APPLICANT_VERSION_CONFLICT. Fail before writing instead.
      if (!applicant) {
        throw new ClientPreconditionError(
          "Applicant not loaded — cannot save without a version.",
        );
      }
      return updateApplicant(
        applicantId,
        toUpdatePayload(values, isAdmin, applicant.record_version),
      );
    },
    successTitle: "Applicant updated",
    successMessage: "Your changes were saved.",
    errorTitle: "Couldn't save changes",
    invalidateKeys: [applicantKeys.lists(), applicantKeys.detail(applicantId)],
    onSuccess: () => setEditOpen(false),
  });

  if (isLoading) {
    return (
      <Center mih={240}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (isError || !applicant) {
    const notFound = getApiError(error).code === "APPLICANT_NOT_FOUND";
    return (
      <ProfileState
        title={
          notFound ? "Applicant not found" : "Couldn't load this applicant"
        }
        description={
          notFound
            ? "This applicant may have been archived or the link is incorrect."
            : "Something went wrong loading the record. Please try again."
        }
        onRetry={notFound ? undefined : () => void refetch()}
      />
    );
  }

  return (
    <>
      <Stack gap="md">
        <ProfileHeader applicant={applicant} />
        <Group justify="flex-end" gap="xs">
          {isAdmin && (
            <Button
              variant="light"
              size="xs"
              leftSection={<FileTextIcon size={14} aria-hidden />}
              onClick={() => router.push(`/documents/${applicantId}`)}
            >
              Prepare documents
            </Button>
          )}
          <ApplicantActionBar
            applicant={applicant}
            onEdit={() => setEditOpen(true)}
          />
        </Group>
        <Divider />
        <ProfileSections applicant={applicant} isAdmin={isAdmin} />
      </Stack>

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit applicant"
        size="lg"
        styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
      >
        <ApplicantEditForm
          initialValues={applicant}
          onSubmit={(values) => editMutation.mutate(values)}
          isLoading={editMutation.isPending}
        />
      </Modal>
    </>
  );
}

/**
 * Applicant profile hub, shown in a modal instead of a dedicated route. Anchors on the
 * applicant's identity + lifecycle state, carries the record's actions, and hosts every
 * detail section in-place (overview by default) — no navigation away from the list. The
 * hub closes explicitly (its X); Escape / click-outside are disabled so the many nested
 * section modals can't collapse it from underneath.
 */
export function ApplicantProfileModal({
  applicantId,
  onClose,
}: ApplicantProfileModalProps) {
  return (
    <Modal
      opened={applicantId !== null}
      onClose={onClose}
      title="Applicant profile"
      size="72rem"
      closeOnEscape={false}
      closeOnClickOutside={false}
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      {applicantId !== null && (
        <ApplicantProfileBody key={applicantId} applicantId={applicantId} />
      )}
    </Modal>
  );
}
