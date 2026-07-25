"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Center,
  Group,
  Loader,
  ModalPaper,
  ModuleHeader,
  Stack,
  Tabs,
  Text,
  Title,
} from "@peppermint/ui";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { GavelIcon } from "@phosphor-icons/react/dist/csr/Gavel";
import { RequireLeadAccess } from "@/components/RequireLeadAccess";
import { getApiError } from "@/lib/authErrorMessages";
import {
  STAGE_COLORS,
  STAGE_LABELS,
} from "@/modules/admin/applicant-journeys/applicantJourneys.labels";
import { RecordAlertsPanel } from "@/modules/admin/notifications/_shared/RecordAlertsPanel";
import { FilesPanel } from "@/modules/admin/uploaded-files/_shared/FilesPanel";
import { useOfferDetail } from "../../offers.hooks";
import { OFFER_STATUS_COLORS, OFFER_STATUS_LABELS } from "../../offers.labels";
import { IssueOfferModal } from "./components/IssueOfferModal";
import { OfferConditionsPanel } from "./components/OfferConditionsPanel";
import { OfferHistoryPanel } from "./components/OfferHistoryPanel";
import { OfferSummaryPanel } from "./components/OfferSummaryPanel";
import { RecordDecisionModal } from "./components/RecordDecisionModal";

type ActiveModal = "issue" | "decision" | null;

function OfferDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const {
    data: offer,
    isLoading,
    isError,
    error,
    refetch,
  } = useOfferDetail(id);

  const notFound =
    isError && getApiError(error).code === "OFFERS_OFFER_NOT_FOUND";

  if (isLoading) {
    return (
      <ModalPaper withBorder>
        <Center h={300}>
          <Loader size="sm" />
        </Center>
      </ModalPaper>
    );
  }

  if (notFound) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Offer not found.
          </Text>
          <Button
            size="xs"
            variant="default"
            onClick={() => router.push("/admin/offers")}
          >
            Back to offers
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  if (isError || !offer) {
    return (
      <ModalPaper withBorder>
        <Stack align="center" gap="xs" py="xl">
          <Text size="sm" c="dimmed">
            Couldn&apos;t load this offer.
          </Text>
          <Button size="xs" variant="default" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      </ModalPaper>
    );
  }

  const closeModal = () => setActiveModal(null);
  const canIssue = offer.status === "draft";
  const canDecide = !offer.is_terminal;

  return (
    <>
      <ModuleHeader
        breadcrumbItems={[
          { label: "Offers", href: "/admin/offers" },
          {
            label: offer.applicant_name || "Offer",
            href: `/admin/offers/${offer.id}`,
          },
        ]}
      />
      <ModalPaper withBorder>
        <Stack gap="md" p="md">
          <Group justify="space-between" align="flex-start" wrap="wrap">
            <Stack gap={4}>
              <Group gap="xs">
                <Title order={4}>{offer.applicant_name || "Offer"}</Title>
                <Badge
                  size="sm"
                  variant="light"
                  color={OFFER_STATUS_COLORS[offer.status]}
                >
                  {OFFER_STATUS_LABELS[offer.status]}
                </Badge>
                <Badge
                  size="sm"
                  variant="outline"
                  color={STAGE_COLORS[offer.journey_stage]}
                  component={Link}
                  href={`/admin/applicant-journeys/${offer.journey}`}
                  style={{ cursor: "pointer" }}
                >
                  Journey: {STAGE_LABELS[offer.journey_stage]}
                </Badge>
              </Group>
              <Text size="xs" c="dimmed">
                {offer.institution_name || "—"}
                {offer.program_title ? ` · ${offer.program_title}` : ""}
              </Text>
            </Stack>

            {canIssue || canDecide ? (
              <Group gap="xs">
                {canIssue ? (
                  <Button
                    size="xs"
                    leftSection={<PaperPlaneTiltIcon size={14} aria-hidden />}
                    onClick={() => setActiveModal("issue")}
                  >
                    Issue offer
                  </Button>
                ) : null}
                {canDecide ? (
                  <Button
                    size="xs"
                    variant="default"
                    leftSection={<GavelIcon size={14} aria-hidden />}
                    onClick={() => setActiveModal("decision")}
                  >
                    Record decision
                  </Button>
                ) : null}
              </Group>
            ) : null}
          </Group>

          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="conditions">Conditions</Tabs.Tab>
              <Tabs.Tab value="files">Files</Tabs.Tab>
              <Tabs.Tab value="alerts">Alerts</Tabs.Tab>
              <Tabs.Tab value="history">History</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="overview" pt="md">
              <OfferSummaryPanel offer={offer} />
            </Tabs.Panel>
            <Tabs.Panel value="conditions" pt="md">
              <OfferConditionsPanel offer={offer} />
            </Tabs.Panel>
            <Tabs.Panel value="files" pt="md">
              <FilesPanel scope={{ offer: offer.id }} />
            </Tabs.Panel>
            <Tabs.Panel value="alerts" pt="md">
              <RecordAlertsPanel sourceEntityId={offer.id} />
            </Tabs.Panel>
            <Tabs.Panel value="history" pt="md">
              <OfferHistoryPanel offerId={offer.id} />
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </ModalPaper>

      <IssueOfferModal
        offer={offer}
        opened={activeModal === "issue"}
        onClose={closeModal}
      />
      <RecordDecisionModal
        offer={offer}
        opened={activeModal === "decision"}
        onClose={closeModal}
      />
    </>
  );
}

export function ModuleOfferDetail() {
  return (
    <RequireLeadAccess>
      <OfferDetailContent />
    </RequireLeadAccess>
  );
}
