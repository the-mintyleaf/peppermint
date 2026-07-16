"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Divider,
  FileInput,
  Group,
  Modal,
  notifications,
  PageBreadcrumb,
  Stack,
  Switch,
  TextInput,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";
import { DataTableShell } from "@peppermint/admin";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { documentsApi } from "../../documents.api";
import type { Signature, SignatureInput } from "../../documents.types";

const signaturesKey = ["documents", "signatures", "all"] as const;

interface SignatureFormState {
  id: string | null;
  name: string;
  title: string;
  organization: string;
  email: string;
  phone: string;
  isActive: boolean;
  imageFile: File | null;
}

const emptyForm: SignatureFormState = {
  id: null,
  name: "",
  title: "",
  organization: "",
  email: "",
  phone: "",
  isActive: true,
  imageFile: null,
};

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

export function SignaturesManager() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SignatureFormState>(emptyForm);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: signaturesKey });
    queryClient.invalidateQueries({
      queryKey: ["documents", "signatures"],
    });
  };

  const saveMutation = useMutation({
    mutationFn: (state: SignatureFormState) =>
      state.id
        ? documentsApi.updateSignature(state.id, toInput(state))
        : documentsApi.createSignature(toInput(state)),
    onSuccess: (_, state) => {
      invalidate();
      setModalOpen(false);
      notifications.show({
        title: state.id ? "Signature updated" : "Signature added",
        message: state.name,
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to save signature",
        message: "Please check the details and try again.",
        color: "red",
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => documentsApi.deactivateSignature(id),
    onSuccess: () => {
      invalidate();
      notifications.show({
        title: "Signature deactivated",
        message: "It is retained for historical documents.",
        color: "green",
      });
    },
    onError: () => {
      notifications.show({
        title: "Failed to deactivate signature",
        message: "Please try again.",
        color: "red",
      });
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (sig: Signature) => {
    setForm({
      id: sig.id,
      name: sig.name,
      title: sig.title ?? "",
      organization: sig.organization ?? "",
      email: "",
      phone: "",
      isActive: sig.is_active,
      imageFile: null,
    });
    setModalOpen(true);
  };

  const columns = [
    { accessor: "name", title: "Name", sortable: true, width: "24%" },
    {
      accessor: "title",
      title: "Title",
      sortable: false,
      width: "20%",
      render: (r: Signature) => r.title || "—",
    },
    {
      accessor: "organization",
      title: "Organization",
      sortable: false,
      width: "20%",
      render: (r: Signature) => r.organization || "—",
    },
    {
      accessor: "is_active",
      title: "Status",
      sortable: false,
      width: "12%",
      render: (r: Signature) => (
        <Badge size="xs" variant="light" color={r.is_active ? "green" : "gray"}>
          {r.is_active ? "active" : "inactive"}
        </Badge>
      ),
    },
    {
      accessor: "has_image",
      title: "Image",
      sortable: false,
      width: "10%",
      render: (r: Signature) => (r.has_image ? "Yes" : "—"),
    },
    {
      accessor: "actions",
      title: "Actions",
      sortable: false,
      width: "14%",
      render: (r: Signature) => (
        <Group gap={4} wrap="nowrap">
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => openEdit(r)}
          >
            Edit
          </Button>
          {r.is_active && (
            <Button
              size="compact-xs"
              variant="subtle"
              color="red"
              loading={deactivateMutation.isPending}
              onClick={() => deactivateMutation.mutate(r.id)}
            >
              Deactivate
            </Button>
          )}
        </Group>
      ),
    },
  ];

  return (
    <>
      <Group pl="md" h={38} justify="space-between">
        <PageBreadcrumb
          items={[
            { label: "Documents", href: "/documents" },
            { label: "Signatures", href: "/documents/signatures" },
          ]}
        />
      </Group>
      <Divider />
      <Group px="md" py="sm" justify="space-between">
        <Button
          variant="subtle"
          size="xs"
          leftSection={<ArrowLeftIcon size={14} />}
          onClick={() => router.push("/documents")}
        >
          Back to documents
        </Button>
        <Button
          size="xs"
          leftSection={<PlusIcon size={14} />}
          onClick={openCreate}
        >
          Add signature
        </Button>
      </Group>

      <DataTableShell<Signature>
        queryKey={signaturesKey}
        queryGetFn={async () => {
          const data = await documentsApi.listSignatures(false);
          return {
            data,
            meta: { total: data.length, page: 1, pageSize: data.length },
          };
        }}
        dataKey="data"
        paginationKey="meta"
        columns={columns}
        moduleInfo={{
          name: "signatures",
          label: "Signatures",
          description: "Signatories referenced by certificates",
        }}
        basePath="/documents/signatures"
        idAccessor="id"
        disableActions
        pageSizes={[10, 20, 50]}
        defaultPageSize={20}
      />

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={form.id ? "Edit signature" : "Add signature"}
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
              onChange={(e) =>
                setForm({ ...form, email: e.currentTarget.value })
              }
            />
            <TextInput
              label="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.currentTarget.value })
              }
            />
          </Group>
          <FileInput
            label="Signature image"
            placeholder={
              form.id ? "Replace image (optional)" : "Upload image (optional)"
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
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={saveMutation.isPending}
              disabled={!form.name.trim()}
              onClick={() => saveMutation.mutate(form)}
            >
              {form.id ? "Save changes" : "Add signature"}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
