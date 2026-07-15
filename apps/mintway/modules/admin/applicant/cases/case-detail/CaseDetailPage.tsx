"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Button,
  Center,
  Group,
  Loader,
  Modal,
  ModalPaper,
  ModuleHeader,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  dayjs,
  useQuery,
} from "@peppermint/ui";
import { DataTableShell, StatusBadge } from "@peppermint/admin";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { ArrowsLeftRightIcon } from "@phosphor-icons/react/dist/csr/ArrowsLeftRight";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";

import { RequireStaff } from "@/components/RequireStaff";
import { getApiError } from "@/lib/authErrorMessages";
import {
  CASE_STATUS_COLORS,
  CASE_STATUS_LABELS,
  caseKeys,
  useApplicantMutation,
} from "../../_shared";
import type { ApplicationCase, CaseStatus } from "../../_shared";
import { fetchCaseStatusHistory, getCase, updateCase } from "../cases.api";
import { CaseEditForm } from "./CaseEditForm";
import { CaseTransitionModal } from "./CaseTransitionModal";
import { caseStatusHistoryColumns } from "./caseStatusHistory.columns";

function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = dayjs(value);
  return d.isValid() ? d.format("MMM D, YYYY") : "—";
}

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

function CaseDetailContent() {
  const { caseId } = useParams<{ caseId: string }>();
  const [editOpen, setEditOpen] = useState(false);
  const [transitionOpen, setTransitionOpen] = useState(false);

  const query = useQuery({
    queryKey: caseKeys.detail(caseId),
    queryFn: () => getCase(caseId),
    retry: false,
  });
  const kase = query.data ?? null;

  const editMutation = useApplicantMutation<
    ApplicationCase,
    Record<string, unknown>
  >({
    mutationFn: (payload) =>
      updateCase(caseId, {
        ...payload,
        record_version: kase?.record_version ?? 0,
      }),
    successTitle: "Case updated",
    successMessage: "Your changes were saved.",
    errorTitle: "Couldn't save changes",
    invalidateKeys: [caseKeys.detail(caseId), caseKeys.lists()],
    onSuccess: () => setEditOpen(false),
    // On a stale-version 409, refetch so a retry carries the fresh record_version
    // instead of re-firing the same conflict.
    onError: (error) => {
      if (getApiError(error).code === "APPLICANT_CASE_VERSION_CONFLICT") {
        void query.refetch();
      }
    },
  });

  const backHref = kase
    ? `/admin/applicants/${kase.applicant}/cases`
    : "/admin/applicants";
  const breadcrumb = [
    { label: "Applicants", href: "/admin/applicants" },
    { label: "Cases", href: backHref },
    {
      label: kase?.case_code ?? "Case",
      href: `/admin/application-cases/${caseId}`,
    },
  ];

  if (query.isLoading) {
    return (
      <>
        <ModuleHeader breadcrumbItems={breadcrumb} />
        <ModalPaper withBorder>
          <Center mih={280}>
            <Loader size="sm" />
          </Center>
        </ModalPaper>
      </>
    );
  }

  if (query.isError || !kase) {
    const notFound =
      getApiError(query.error).code === "APPLICANT_CASE_NOT_FOUND";
    return (
      <>
        <ModuleHeader breadcrumbItems={breadcrumb} />
        <ModalPaper withBorder>
          <Center mih={280}>
            <Stack align="center" gap="xs" maw={360}>
              <ThemeIcon size={44} radius="xl" color="gray" variant="light">
                <WarningCircleIcon size={22} weight="fill" aria-hidden />
              </ThemeIcon>
              <Title order={4} ta="center">
                {notFound ? "Case not found" : "Couldn't load this case"}
              </Title>
              <Text size="sm" c="dimmed" ta="center">
                {notFound
                  ? "This case may have been archived or the link is incorrect."
                  : "Something went wrong. Please try again."}
              </Text>
            </Stack>
          </Center>
        </ModalPaper>
      </>
    );
  }

  const isArchived = Boolean(kase.archived_at);

  return (
    <>
      <ModuleHeader breadcrumbItems={breadcrumb} />

      <ModalPaper withBorder mb="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Group gap="xs">
              <Title order={3}>{kase.case_code}</Title>
              <StatusBadge<CaseStatus>
                value={kase.case_status}
                colorMap={CASE_STATUS_COLORS}
                labelMap={CASE_STATUS_LABELS}
              />
            </Group>
            <Text size="xs" c="dimmed">
              {[kase.destination_country, kase.institution, kase.program]
                .filter(Boolean)
                .join(" · ") || "—"}
            </Text>
          </Stack>
          <Group gap="xs">
            <Button
              size="xs"
              variant="default"
              leftSection={<PencilSimpleIcon size={14} />}
              onClick={() => setEditOpen(true)}
              disabled={isArchived}
            >
              Edit
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={<ArrowsLeftRightIcon size={14} />}
              onClick={() => setTransitionOpen(true)}
              disabled={isArchived}
            >
              Change status
            </Button>
          </Group>
        </Group>
      </ModalPaper>

      <ModalPaper withBorder mb="md">
        <Stack gap="sm">
          <Title order={6}>Details</Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            <Field label="Destination" value={kase.destination_country} />
            <Field label="Institution" value={kase.institution} />
            <Field label="Program" value={kase.program} />
            <Field label="Study level" value={kase.study_level} />
            <Field label="Intake" value={kase.intake} />
            <Field
              label="Application reference"
              value={kase.application_reference}
            />
            <Field label="Opened" value={fmtDate(kase.opened_at)} />
            <Field label="Closed" value={fmtDate(kase.closed_at)} />
            <Field label="Outcome" value={kase.outcome} />
          </SimpleGrid>
          {kase.notes && <Field label="Notes" value={kase.notes} />}
        </Stack>
      </ModalPaper>

      <ModalPaper withBorder>
        <Stack gap="sm">
          <Title order={6}>Status history</Title>
          <DataTableShell
            queryKey={["applicant.case-status-history", caseId]}
            queryGetFn={(params) => fetchCaseStatusHistory(caseId, params)}
            enableServerQuery
            dataKey="data"
            paginationKey="meta"
            idAccessor="id"
            columns={caseStatusHistoryColumns}
            moduleInfo={{
              name: "case-status-change",
              label: "Status history",
              description: "Case status changes, newest first",
            }}
            disableActions
            disableCreateButton
            hideToolbar
            pageSizes={[10, 20, 30, 50]}
            defaultPageSize={10}
          />
        </Stack>
      </ModalPaper>

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit case"
        size="lg"
      >
        <CaseEditForm
          kase={kase}
          onSubmit={(payload) => editMutation.mutate(payload)}
          isLoading={editMutation.isPending}
        />
      </Modal>

      <CaseTransitionModal
        kase={kase}
        opened={transitionOpen}
        onClose={() => setTransitionOpen(false)}
      />
    </>
  );
}

/** Application case detail — update, transition, and status history (§10). Admin only. */
export function CaseDetailPage() {
  return (
    <RequireStaff>
      <CaseDetailContent />
    </RequireStaff>
  );
}
