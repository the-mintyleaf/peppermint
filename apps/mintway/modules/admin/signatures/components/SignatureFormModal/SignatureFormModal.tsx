"use client";

import { useState } from "react";
import {
  Button,
  FileInput,
  Group,
  Modal,
  notifications,
  Stack,
  Switch,
  TextInput,
  useMutation,
} from "@peppermint/ui";
import { documentsApi } from "@/modules/documents";
import type { Signature, SignatureInput } from "@/modules/documents";
import type { SignatureFormModalProps } from "./SignatureFormModal.types";

interface SignatureFormState {
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  isActive: boolean;
  imageFile: File | null;
}

function initialState(signature: Signature | null): SignatureFormState {
  return {
    name: signature?.name ?? "",
    title: signature?.title ?? "",
    organization: signature?.organization ?? "",
    email: "",
    phone: "",
    isActive: signature?.is_active ?? true,
    imageFile: null,
  };
}

function toInput(form: SignatureFormState): SignatureInput {
  return {
    name: form.name.trim(),
    title: form.title.trim() || undefined,
    organization: form.organization.trim() || undefined,
    email: form.email.trim() || undefined,
    phone: form.phone.trim() || undefined,
    isActive: form.isActive,
    imageFile: form.imageFile,
  };
}

/**
 * Create / edit a signatory. Mounted fresh per open (parent keys on the signature id), so the
 * form initializes from the `signature` prop without effect-based syncing.
 */
export function SignatureFormModal({
  opened,
  signature,
  onClose,
  onSaved,
}: SignatureFormModalProps) {
  const [form, setForm] = useState<SignatureFormState>(() =>
    initialState(signature),
  );
  const isEditing = signature !== null;

  const saveMutation = useMutation({
    mutationFn: (state: SignatureFormState) =>
      isEditing
        ? documentsApi.updateSignature(signature.id, toInput(state))
        : documentsApi.createSignature(toInput(state)),
    onSuccess: (_, state) => {
      notifications.show({
        title: isEditing ? "Signature updated" : "Signature added",
        message: state.name,
        color: "green",
      });
      onSaved();
    },
    onError: () => {
      notifications.show({
        title: "Failed to save signature",
        message: "Please check the details and try again.",
        color: "red",
      });
    },
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? "Edit signature" : "Add signature"}
      centered
    >
      <Stack gap="sm">
        <TextInput
          label="Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.currentTarget.value })}
        />
        <TextInput
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.currentTarget.value })}
        />
        <TextInput
          label="Organization"
          value={form.organization}
          onChange={(e) =>
            setForm({ ...form, organization: e.currentTarget.value })
          }
        />
        <Group grow>
          <TextInput
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.currentTarget.value })}
          />
          <TextInput
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.currentTarget.value })}
          />
        </Group>
        <FileInput
          label="Signature image"
          placeholder={
            isEditing ? "Replace image (optional)" : "Upload image (optional)"
          }
          accept="image/png,image/jpeg,image/webp"
          value={form.imageFile}
          onChange={(file) => setForm({ ...form, imageFile: file })}
          clearable
        />
        <Switch
          label="Active"
          checked={form.isActive}
          onChange={(e) =>
            setForm({ ...form, isActive: e.currentTarget.checked })
          }
        />
        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saveMutation.isPending}
            disabled={!form.name.trim()}
            onClick={() => saveMutation.mutate(form)}
          >
            {isEditing ? "Save changes" : "Add signature"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
