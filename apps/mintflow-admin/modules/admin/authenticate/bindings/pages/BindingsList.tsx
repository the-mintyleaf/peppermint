"use client";

import { useState } from "react";
import { ModalTableShell } from "@peppermint/admin";
import {
  Button,
  Group,
  ModalPaper,
  ModuleHeader,
  Stack,
  Text,
  Textarea,
  modals,
  notifications,
  useMutation,
  useQueryClient,
} from "@peppermint/ui";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiErrorMessage } from "@/lib/authErrorMessages";
import { RoleBindingForm } from "../form";
import type { RoleBindingFormValues } from "../form/RoleBindingForm.types";
import type { CreateRoleBindingPayload } from "../bindings.api";
import {
  createRoleBinding,
  fetchRoleBindings,
  revokeRoleBinding,
} from "../bindings.api";
import { buildBindingsColumns } from "../bindings.columns";
import { roleBindingQueryKeys } from "../bindings.queryKeys";
import type { RoleBinding } from "../bindings.types";

interface RevokeModalContentProps {
  binding: RoleBinding;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

function RevokeModalContent({
  binding,
  onConfirm,
  onCancel,
}: RevokeModalContentProps) {
  const [reason, setReason] = useState("");

  return (
    <Stack gap="sm">
      <Text size="sm">
        Revoke this binding for role <b>{binding.role}</b>? The user will
        immediately lose the permissions it granted.
      </Text>
      <Textarea
        label="Reason"
        placeholder="Optional"
        autosize
        minRows={2}
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
      />
      <Group justify="flex-end" gap="xs">
        <Button variant="default" size="xs" onClick={onCancel}>
          Cancel
        </Button>
        <Button color="red" size="xs" onClick={() => onConfirm(reason)}>
          Revoke
        </Button>
      </Group>
    </Stack>
  );
}

export function BindingsList() {
  return (
    <RequireStaff>
      <BindingsListContent />
    </RequireStaff>
  );
}

function BindingsListContent() {
  const queryClient = useQueryClient();

  const invalidateBindings = () => {
    void queryClient.invalidateQueries({
      queryKey: roleBindingQueryKeys.listKey(),
    });
  };

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      revokeRoleBinding(id, reason),
    onSuccess: () => {
      notifications.show({
        color: "green",
        title: "Binding revoked",
        message: "The role binding has been revoked.",
      });
      invalidateBindings();
    },
    onError: () => {
      notifications.show({
        color: "red",
        title: "Couldn't revoke binding",
        message: "Something went wrong. Please try again.",
      });
    },
  });

  const requestRevoke = (binding: RoleBinding) => {
    const modalId = "revoke-role-binding";
    modals.open({
      modalId,
      title: "Revoke binding",
      children: (
        <RevokeModalContent
          binding={binding}
          onCancel={() => modals.close(modalId)}
          onConfirm={(reason) => {
            revokeMutation.mutate({
              id: binding.id,
              reason: reason || undefined,
            });
            modals.close(modalId);
          }}
        />
      ),
    });
  };

  const columns = buildBindingsColumns({ onRevoke: requestRevoke });

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Bindings", href: "/admin/authenticate/bindings" },
        ]}
      />
      <ModalPaper withBorder>
        <ModalTableShell<RoleBinding, RoleBindingFormValues>
          queryKey={roleBindingQueryKeys.list()}
          queryGetFn={fetchRoleBindings}
          dataKey="data"
          paginationKey="meta"
          enableServerQuery
          columns={columns}
          moduleInfo={{
            name: "role binding",
            label: "Bindings",
            description: "Assign a role to a user under a scope.",
          }}
          idAccessor="id"
          createFormComponent={RoleBindingForm}
          onCreateApi={(values) =>
            createRoleBinding(values as CreateRoleBindingPayload)
          }
          getErrorMessage={getApiErrorMessage}
          pageSizes={[10, 20, 30, 50]}
          defaultPageSize={20}
        />
      </ModalPaper>
    </>
  );
}
