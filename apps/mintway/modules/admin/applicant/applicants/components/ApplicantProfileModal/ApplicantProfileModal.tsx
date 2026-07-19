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
  ModalPaper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@peppermint/ui";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { getApiError } from "@/lib/authErrorMessages";
import {
  applicantKeys,
  updateApplicant,
  useApplicant,
  useApplicantMutation,
} from "../../../_shared";
import type { Applicant } from "../../../_shared";
import { ApplicantActionBar } from "../ApplicantActions/ApplicantActionBar";
import { ApplicantEditForm, toUpdatePayload } from "../../form";
import type { ApplicantFormValues } from "../../form";
import { ProfileHero } from "./ProfileHero";
import { ProfileSectionTile } from "./ProfileSectionTile";
import { getProfileSectionTiles } from "./sectionTiles";
import styles from "./ApplicantProfileModal.module.css";
import type {
  ApplicantProfileBodyProps,
  ApplicantProfileModalProps,
} from "./ApplicantProfileModal.types";

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

function ApplicantProfileBody({
  applicantId,
  onClose,
  onEditingChange,
}: ApplicantProfileBodyProps) {
  const router = useRouter();
  const { applicant, isLoading, isError, error, isAdmin, refetch } =
    useApplicant(applicantId);
  const [editOpen, setEditOpen] = useState(false);

  // Keep the parent modal informed so it can hold its ground (no Escape / click-outside
  // close) while the edit form owns the foreground.
  const setEditing = (open: boolean) => {
    setEditOpen(open);
    onEditingChange(open);
  };

  const editMutation = useApplicantMutation<Applicant, ApplicantFormValues>({
    mutationFn: (values) =>
      updateApplicant(
        applicantId,
        toUpdatePayload(values, isAdmin, applicant?.record_version ?? 0),
      ),
    successTitle: "Applicant updated",
    successMessage: "Your changes were saved.",
    errorTitle: "Couldn't save changes",
    invalidateKeys: [applicantKeys.lists(), applicantKeys.detail(applicantId)],
    onSuccess: () => setEditing(false),
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

  const tiles = getProfileSectionTiles(applicantId, isAdmin);

  return (
    <>
      <Stack gap="md">
        <ModalPaper withBorder>
          <Stack gap="sm">
            <ProfileHero applicant={applicant} />
            <Divider />
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
                onEdit={() => setEditing(true)}
              />
            </Group>
          </Stack>
        </ModalPaper>

        <Stack gap="xs">
          <Title order={6}>Sections</Title>
          <div className={styles.grid}>
            {tiles.map((tile) => (
              <ProfileSectionTile
                key={tile.id}
                tile={tile}
                onNavigate={onClose}
              />
            ))}
          </div>
        </Stack>
      </Stack>

      <Modal
        opened={editOpen}
        onClose={() => setEditing(false)}
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
 * applicant's identity + lifecycle state, carries the record's actions, and launches
 * into each detail section — which remain full routes the tiles link out to.
 */
export function ApplicantProfileModal({
  applicantId,
  onClose,
}: ApplicantProfileModalProps) {
  const [editing, setEditing] = useState(false);

  const handleClose = () => {
    setEditing(false);
    onClose();
  };

  return (
    <Modal
      opened={applicantId !== null}
      onClose={handleClose}
      title="Applicant profile"
      size={760}
      // While the nested edit form is open it owns Escape / click-outside; the parent
      // must not close underneath it.
      closeOnEscape={!editing}
      closeOnClickOutside={!editing}
      styles={{ body: { padding: "var(--mantine-spacing-md)" } }}
    >
      {applicantId !== null && (
        <ApplicantProfileBody
          applicantId={applicantId}
          onClose={onClose}
          onEditingChange={setEditing}
        />
      )}
    </Modal>
  );
}
