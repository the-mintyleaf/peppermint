"use client";

import { Modal, Text } from "@peppermint/ui";
import { OrganizationsForm } from "../../../organizations/form";
import { PeopleForm } from "../../../people/form";
import { PositionsForm } from "../../../positions/form/PositionsForm";
import { SitesForm } from "../../../sites/form";
import { DelegationsForm } from "../../../delegations/form";
import { UnitsForm } from "./forms/UnitsForm";
import type {
  OrgOfficeData,
  DepartmentData,
} from "../../OrganizationTree.types";
import type { NodeFormModalProps } from "./NodeFormModal.types";
import type { Organization } from "../../../organizations/organizations.types";
import type { UnitsFormValues } from "./forms/UnitsForm/UnitsForm.types";
import type { PeopleFormValues } from "../../../people/form/peopleForm.types";
import type { PositionsFormValues } from "../../../positions/form/PositionsForm/PositionsForm.types";
import type { Site } from "../../../sites/sites.types";
import type { Delegation } from "../../../delegations/delegations.types";

const TITLE_MAP: Record<string, Record<"add" | "edit", string>> = {
  org: { add: "Add Organization", edit: "Edit Organization" },
  department: { add: "Add Unit / Department", edit: "Edit Unit" },
  person: { add: "Add Person", edit: "Edit Person" },
  position: { add: "Add Position", edit: "Edit Position" },
  site: { add: "Add Site", edit: "Edit Site" },
  delegation: { add: "Add Delegation", edit: "Edit Delegation" },
};

export function NodeFormModal({
  opened,
  onClose,
  mode,
  nodeType,
  initialData,
  onSubmitOrg,
  onSubmitDepartment,
  onSubmitPerson,
  onSubmitPosition,
  onSubmitSite,
  onSubmitDelegation,
  pendingParentName,
  pendingContextNodeId,
  isLoading = false,
}: NodeFormModalProps) {
  const resolvedType = nodeType ?? initialData?.nodeType ?? "department";
  const title =
    TITLE_MAP[resolvedType]?.[mode] ?? (mode === "add" ? "Add" : "Edit");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{title}</Text>}
      size="md"
      centered
    >
      {/* Parent context banner */}
      {mode === "add" && pendingParentName && (
        <div
          style={{
            background: "var(--mantine-color-blue-0)",
            borderRadius: 6,
            padding: "8px 12px",
            margin: "0 0 4px",
            border: "1px solid var(--mantine-color-blue-2)",
          }}
        >
          <Text size="xs" c="dimmed">
            Adding under:
          </Text>
          <Text size="xs" fw={600} c="blue">
            {pendingParentName}
          </Text>
        </div>
      )}

      {resolvedType === "org" && (
        <OrganizationsForm
          initialValues={
            initialData?.nodeType === "org"
              ? {
                  name: (initialData as OrgOfficeData).name,
                  description: (initialData as OrgOfficeData).description ?? "",
                }
              : undefined
          }
          onSubmit={(values: Organization) => {
            onSubmitOrg(values);
            onClose();
          }}
          isLoading={isLoading}
        />
      )}

      {resolvedType === "department" && (
        <UnitsForm
          initialValues={
            initialData?.nodeType === "department"
              ? {
                  name: (initialData as DepartmentData).name,
                  description:
                    (initialData as DepartmentData).description ?? "",
                }
              : undefined
          }
          onSubmit={(values) => {
            onSubmitDepartment(values);
            onClose();
          }}
          isLoading={isLoading}
          isEditing={mode === "edit"}
        />
      )}

      {resolvedType === "person" && (
        <PeopleForm
          onSubmit={(values) => {
            onSubmitPerson(values);
            onClose();
          }}
          isLoading={isLoading}
        />
      )}

      {resolvedType === "position" && (
        <PositionsForm
          onSubmit={(values) => {
            onSubmitPosition(values);
            onClose();
          }}
          isLoading={isLoading}
          isEditing={mode === "edit"}
        />
      )}

      {resolvedType === "site" && (
        <SitesForm
          onSubmit={(values) => {
            onSubmitSite(values);
            onClose();
          }}
          isLoading={isLoading}
        />
      )}

      {resolvedType === "delegation" && (
        <DelegationsForm
          onSubmit={(values) => {
            onSubmitDelegation(values);
            onClose();
          }}
          isLoading={isLoading}
          lockedFromNodeId={pendingContextNodeId}
          lockedFromName={pendingParentName}
        />
      )}
    </Modal>
  );
}
