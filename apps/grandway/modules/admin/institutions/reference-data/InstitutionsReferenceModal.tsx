"use client";

import { useState } from "react";
import { Box, Modal, Tabs, modals } from "@peppermint/ui";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { BooksIcon } from "@phosphor-icons/react/dist/csr/Books";
import { useCountries, useFields } from "../institutions.hooks";
import { CountryCard } from "./components/CountryCard";
import { CountryForm } from "./components/CountryForm";
import { FieldCard } from "./components/FieldCard";
import { FieldForm } from "./components/FieldForm";
import { ReferenceCrudPanel } from "./components/ReferenceCrudPanel";
import type { InstitutionsReferenceModalProps } from "./InstitutionsReferenceModal.types";

type ReferenceTab = "countries" | "fields";

function CountriesTab({
  onDraftStateChange,
}: {
  onDraftStateChange: (hasDraft: boolean) => void;
}) {
  const { data = [], isLoading, isError, refetch } = useCountries();
  return (
    <ReferenceCrudPanel
      entityLabel="country"
      entries={data}
      isEntryActive={(c) => c.availability_status !== "inactive"}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      renderCreateForm={(onDone) => (
        <CountryForm mode="create" onDone={onDone} />
      )}
      renderEditForm={(entry, onDone) => (
        <CountryForm mode="edit" initialEntry={entry} onDone={onDone} />
      )}
      renderCard={(entry, onEdit) => (
        <CountryCard key={entry.id} country={entry} onEdit={onEdit} />
      )}
      onDraftStateChange={onDraftStateChange}
    />
  );
}

function FieldsTab({
  onDraftStateChange,
}: {
  onDraftStateChange: (hasDraft: boolean) => void;
}) {
  const { data = [], isLoading, isError, refetch } = useFields();
  return (
    <ReferenceCrudPanel
      entityLabel="field"
      entries={data}
      isEntryActive={(f) => f.is_active}
      isLoading={isLoading}
      isError={isError}
      onRetry={() => void refetch()}
      renderCreateForm={(onDone) => <FieldForm mode="create" onDone={onDone} />}
      renderEditForm={(entry, onDone) => (
        <FieldForm mode="edit" initialEntry={entry} onDone={onDone} />
      )}
      renderCard={(entry, onEdit) => (
        <FieldCard key={entry.id} field={entry} onEdit={onEdit} />
      )}
      onDraftStateChange={onDraftStateChange}
    />
  );
}

/**
 * Countries + Fields admin, opened from the Programs header — Admin only (the
 * trigger is hidden from a Lead Manager at the call site). Guards its own close
 * when either tab has an unsaved draft.
 */
export function InstitutionsReferenceModal({
  opened,
  onClose,
}: InstitutionsReferenceModalProps) {
  const [activeTab, setActiveTab] = useState<ReferenceTab>("countries");
  const [countriesDraft, setCountriesDraft] = useState(false);
  const [fieldsDraft, setFieldsDraft] = useState(false);

  const handleClose = () => {
    if (!countriesDraft && !fieldsDraft) {
      onClose();
      return;
    }
    modals.openConfirmModal({
      title: "Discard changes?",
      children:
        "You have an unsaved country or field draft. Closing now won't save it.",
      labels: { confirm: "Discard", cancel: "Keep editing" },
      confirmProps: { color: "red" },
      styles: { inner: { padding: "var(--mantine-spacing-md)" } },
      onConfirm: onClose,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Countries & fields"
      size={640}
      radius="md"
      centered
    >
      <Box p="md">
        <Tabs
          value={activeTab}
          onChange={(value) =>
            setActiveTab((value as ReferenceTab | null) ?? "countries")
          }
        >
          <Tabs.List>
            <Tabs.Tab
              value="countries"
              leftSection={<GlobeIcon size={14} aria-hidden />}
            >
              Countries
            </Tabs.Tab>
            <Tabs.Tab
              value="fields"
              leftSection={<BooksIcon size={14} aria-hidden />}
            >
              Fields
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="countries" pt="md">
            <CountriesTab onDraftStateChange={setCountriesDraft} />
          </Tabs.Panel>
          <Tabs.Panel value="fields" pt="md">
            <FieldsTab onDraftStateChange={setFieldsDraft} />
          </Tabs.Panel>
        </Tabs>
      </Box>
    </Modal>
  );
}
