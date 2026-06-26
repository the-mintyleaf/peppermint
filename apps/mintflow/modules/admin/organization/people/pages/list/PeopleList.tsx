"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ModalTableShell } from "@peppermint/admin";
import type { DataTableShellTab } from "@peppermint/admin";
import { Paper } from "@peppermint/ui";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react/dist/csr/EnvelopeSimple";
import { MinusCircleIcon } from "@phosphor-icons/react/dist/csr/MinusCircle";
import { ProhibitIcon } from "@phosphor-icons/react/dist/csr/Prohibit";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { ReasonConfirmDialog } from "../../../_shared/ReasonConfirmDialog";
import { PeopleProfileDrawer } from "../../components/PeopleProfileDrawer";
import { PeopleCreateForm } from "../../form";
import { createPerson, fetchPeople } from "../../people.api";
import {
  getMembershipStatusActionLabel,
  MEMBERSHIP_STATUS_REQUIRES_REASON,
} from "../../people.constants";
import { useChangeMembershipStatus } from "../../people.hooks";
import { peopleQueryKeys } from "../../people.queryKeys";
import type {
  MembershipStatus,
  Person,
  CreatePersonPayload,
} from "../../people.types";
import { getPeopleColumns } from "./people.columns";

const TABS: DataTableShellTab[] = [
  { label: "All", icon: UsersIcon },
  {
    label: "Active",
    icon: CheckCircleIcon,
    filter: { membership_status: "active" },
  },
  {
    label: "Invited",
    icon: EnvelopeSimpleIcon,
    filter: { membership_status: "invited" },
  },
  {
    label: "Inactive",
    icon: MinusCircleIcon,
    filter: { membership_status: "inactive" },
  },
  {
    label: "Suspended",
    icon: ProhibitIcon,
    filter: { membership_status: "suspended" },
  },
  {
    label: "Ended",
    icon: XCircleIcon,
    filter: { membership_status: "ended" },
  },
];

type StatusChangeTarget = {
  person: Person;
  newStatus: MembershipStatus;
};

export function PeopleList() {
  const { id: orgId = "" } = useParams<{ id: string }>();
  const [profileTarget, setProfileTarget] = useState<Person | null>(null);
  const [statusTarget, setStatusTarget] = useState<StatusChangeTarget | null>(
    null,
  );

  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeMembershipStatus(orgId);

  const columns = useMemo(
    () =>
      getPeopleColumns(
        (person) => setProfileTarget(person),
        (person, newStatus) => {
          if (MEMBERSHIP_STATUS_REQUIRES_REASON.includes(newStatus)) {
            setStatusTarget({ person, newStatus });
          } else {
            changeStatus({
              id: person.id,
              payload: { status: newStatus, reason: "" },
            });
          }
        },
      ),
    [changeStatus],
  );

  function handleStatusConfirm(reason: string) {
    if (!statusTarget) return;
    changeStatus(
      {
        id: statusTarget.person.id,
        payload: { status: statusTarget.newStatus, reason },
      },
      {
        onSuccess: (updated) => {
          setStatusTarget(null);
          if (profileTarget?.id === updated.id) {
            setProfileTarget(updated);
          }
        },
      },
    );
  }

  function handleProfileStatusChange(
    person: Person,
    newStatus: MembershipStatus,
  ) {
    if (MEMBERSHIP_STATUS_REQUIRES_REASON.includes(newStatus)) {
      setStatusTarget({ person, newStatus });
    } else {
      changeStatus(
        {
          id: person.id,
          payload: { status: newStatus, reason: "" },
        },
        {
          onSuccess: (updated) => {
            if (profileTarget?.id === updated.id) {
              setProfileTarget(updated);
            }
          },
        },
      );
    }
  }

  const statusActionLabel = statusTarget
    ? getMembershipStatusActionLabel(statusTarget.newStatus)
    : "";

  return (
    <>
      <Paper
        p={0}
        withBorder
        radius="var(--mantine-radius-default)"
        h="calc(100vh - 16px)"
      >
        <ModalTableShell<Person>
          queryKey={peopleQueryKeys.list(orgId)}
          queryGetFn={(params) => fetchPeople(orgId, params)}
          dataKey="data"
          paginationKey="meta"
          enableServerQuery
          columns={columns}
          moduleInfo={{
            name: "members",
            label: "Members",
            description: "Manage organization membership and placements",
          }}
          idAccessor="id"
          createFormComponent={PeopleCreateForm}
          createModalTitle="Add Member"
          transformOnCreate={(values) => {
            const v = values as unknown as CreatePersonPayload;
            return {
              user_id: v.user_id,
              employee_code: v.employee_code ?? "",
              joined_at: v.joined_at ?? null,
              is_primary: v.is_primary ?? false,
            };
          }}
          onCreateApi={(values) =>
            createPerson(orgId, values as Parameters<typeof createPerson>[1])
          }
          onReviewClick={(record) => setProfileTarget(record)}
          pageSizes={[10, 20, 50]}
          defaultPageSize={20}
          tabs={TABS}
          basePath={`/admin/organization/${orgId}/members`}
        />
      </Paper>

      <PeopleProfileDrawer
        person={profileTarget}
        opened={profileTarget !== null}
        onClose={() => setProfileTarget(null)}
        onStatusChange={handleProfileStatusChange}
      />

      <ReasonConfirmDialog
        opened={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        title={statusActionLabel}
        description={`This will ${statusActionLabel.toLowerCase()} "${statusTarget?.person.user_display_name}".`}
        confirmLabel={statusActionLabel}
        confirmColor={
          statusTarget?.newStatus === "ended" ||
          statusTarget?.newStatus === "archived"
            ? "red"
            : statusTarget?.newStatus === "suspended"
              ? "orange"
              : "blue"
        }
        onConfirm={handleStatusConfirm}
        loading={isChangingStatus}
      />
    </>
  );
}
