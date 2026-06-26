"use client";

import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Text,
  NumberInput,
} from "@peppermint/ui";
import { useForm } from "@peppermint/ui";
import type { NodeFormModalProps } from "./NodeFormModal.types";
import type {
  OrgNodeData,
  OrgOfficeData,
  DepartmentData,
  PersonData,
} from "../../../../organization.types";

const ORG_TYPE_OPTIONS = [
  { value: "ministry", label: "Ministry" },
  { value: "office", label: "Office" },
  { value: "department", label: "Department" },
  { value: "organization", label: "Organization" },
  { value: "branch", label: "Branch" },
  { value: "district", label: "District Administration" },
];

const DEPT_TYPE_OPTIONS = [
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "section", label: "Section" },
  { value: "unit", label: "Unit" },
  { value: "team", label: "Team" },
  { value: "branch", label: "Branch" },
  { value: "committee", label: "Committee" },
];

const PERSON_ROLE_OPTIONS = [
  { value: "head", label: "Head / Director" },
  { value: "manager", label: "Manager" },
  { value: "coordinator", label: "Coordinator" },
  { value: "officer", label: "Officer" },
  { value: "member", label: "Member" },
  { value: "advisor", label: "Advisor" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

const TITLE_MAP = {
  org: { add: "Add Organization / Office", edit: "Edit Organization" },
  department: { add: "Add Department", edit: "Edit Department" },
  person: { add: "Add Person", edit: "Edit Person" },
};

export function NodeFormModal({
  opened,
  onClose,
  mode,
  nodeType,
  initialData,
  onSubmit,
}: NodeFormModalProps) {
  const resolvedType =
    nodeType ??
    (initialData as OrgNodeData | undefined)?.nodeType ??
    "department";
  const title = TITLE_MAP[resolvedType]?.[mode] ?? "Add Node";

  interface OrgFormValues {
    name: string;
    orgType: string;
    description: string;
    location: string;
    status: string;
    headCount?: number;
    activeTasks?: number;
  }

  interface DeptFormValues {
    name: string;
    deptType: string;
    description: string;
    head: string;
    parentName: string;
    peopleCount: number;
    activeTasks: number;
    completedTasks: number;
    pendingTasks: number;
    status: string;
    color?: string;
  }

  interface PersonFormValues {
    fullName: string;
    designation: string;
    department: string;
    role: string;
    email: string;
    phone: string;
    status: string;
    reportingManager: string;
  }

  const orgForm = useForm<OrgFormValues>({
    initialValues: {
      name: "",
      orgType: "organization",
      description: "",
      location: "",
      status: "active",
      headCount: undefined,
      activeTasks: undefined,
      ...(initialData?.nodeType === "org"
        ? (initialData as Partial<OrgOfficeData>)
        : {}),
    },
    validate: {
      name: (v) => (!v?.trim() ? "Name is required" : null),
      orgType: (v) => (!v ? "Type is required" : null),
    },
  });

  const deptForm = useForm<DeptFormValues>({
    initialValues: {
      name: "",
      deptType: "department",
      description: "",
      head: "",
      parentName: "",
      peopleCount: 0,
      activeTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      status: "active",
      color: undefined,
      ...(initialData?.nodeType === "department"
        ? (initialData as Partial<DepartmentData>)
        : {}),
    },
    validate: {
      name: (v) => (!v?.trim() ? "Name is required" : null),
      deptType: (v) => (!v ? "Type is required" : null),
    },
  });

  const personForm = useForm<PersonFormValues>({
    initialValues: {
      fullName: "",
      designation: "",
      department: "",
      role: "member",
      email: "",
      phone: "",
      status: "active",
      reportingManager: "",
      ...(initialData?.nodeType === "person"
        ? (initialData as Partial<PersonData>)
        : {}),
    },
    validate: {
      fullName: (v) => (!v?.trim() ? "Full name is required" : null),
      designation: (v) => (!v?.trim() ? "Designation is required" : null),
    },
  });

  const handleSubmit = () => {
    if (resolvedType === "org") {
      const result = orgForm.validate();
      if (result.hasErrors) return;
      onSubmit({ nodeType: "org", ...orgForm.values } as OrgOfficeData);
    } else if (resolvedType === "department") {
      const result = deptForm.validate();
      if (result.hasErrors) return;
      onSubmit({
        nodeType: "department",
        ...deptForm.values,
      } as DepartmentData);
    } else {
      const result = personForm.validate();
      if (result.hasErrors) return;
      onSubmit({ nodeType: "person", ...personForm.values } as PersonData);
    }
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{title}</Text>}
      size="md"
      centered
    >
      <Stack gap="md" px="md">
        {resolvedType === "org" && (
          <>
            <TextInput
              label="Name"
              placeholder="e.g. Ministry of Home Affairs"
              required
              {...orgForm.getInputProps("name")}
            />
            <Select
              label="Organization Type"
              data={ORG_TYPE_OPTIONS}
              required
              {...orgForm.getInputProps("orgType")}
            />
            <Textarea
              label="Description"
              placeholder="Brief description…"
              rows={3}
              {...orgForm.getInputProps("description")}
            />
            <TextInput
              label="Location"
              placeholder="City or address"
              {...orgForm.getInputProps("location")}
            />
            <Group grow>
              <NumberInput
                label="Head count"
                placeholder="0"
                min={0}
                {...orgForm.getInputProps("headCount")}
              />
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                {...orgForm.getInputProps("status")}
              />
            </Group>
          </>
        )}

        {resolvedType === "department" && (
          <>
            <TextInput
              label="Department Name"
              placeholder="e.g. Human Resources"
              required
              {...deptForm.getInputProps("name")}
            />
            <Select
              label="Department Type"
              data={DEPT_TYPE_OPTIONS}
              required
              {...deptForm.getInputProps("deptType")}
            />
            <TextInput
              label="Department Head"
              placeholder="Name of the head"
              {...deptForm.getInputProps("head")}
            />
            <Textarea
              label="Description"
              placeholder="What does this department do?"
              rows={3}
              {...deptForm.getInputProps("description")}
            />
            <Group grow>
              <NumberInput
                label="People count"
                min={0}
                {...deptForm.getInputProps("peopleCount")}
              />
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                {...deptForm.getInputProps("status")}
              />
            </Group>
          </>
        )}

        {resolvedType === "person" && (
          <>
            <TextInput
              label="Full Name"
              placeholder="e.g. Ramesh Sharma"
              required
              {...personForm.getInputProps("fullName")}
            />
            <TextInput
              label="Designation"
              placeholder="e.g. Senior Officer"
              required
              {...personForm.getInputProps("designation")}
            />
            <Group grow>
              <Select
                label="Role"
                data={PERSON_ROLE_OPTIONS}
                {...personForm.getInputProps("role")}
              />
              <Select
                label="Status"
                data={STATUS_OPTIONS}
                {...personForm.getInputProps("status")}
              />
            </Group>
            <TextInput
              label="Department"
              placeholder="Department name"
              {...personForm.getInputProps("department")}
            />
            <TextInput
              label="Reporting Manager"
              placeholder="Manager's name"
              {...personForm.getInputProps("reportingManager")}
            />
            <Group grow>
              <TextInput
                label="Email"
                type="email"
                placeholder="name@example.com"
                {...personForm.getInputProps("email")}
              />
              <TextInput
                label="Phone"
                placeholder="+977 …"
                {...personForm.getInputProps("phone")}
              />
            </Group>
          </>
        )}

        <Group justify="flex-end" mt="xs">
          <Button variant="subtle" color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {mode === "add" ? "Add to canvas" : "Save changes"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
