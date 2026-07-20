"use client";

import type { ComponentType, ReactNode } from "react";
import type { Icon } from "@phosphor-icons/react";
import { Stack, Tabs } from "@peppermint/ui";
import { IdentificationCardIcon } from "@phosphor-icons/react/dist/csr/IdentificationCard";
import { FilesIcon } from "@phosphor-icons/react/dist/csr/Files";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/csr/ChatCircleText";
import { TranslateIcon } from "@phosphor-icons/react/dist/csr/Translate";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { LifebuoyIcon } from "@phosphor-icons/react/dist/csr/Lifebuoy";
import { AddressBookIcon } from "@phosphor-icons/react/dist/csr/AddressBook";
import { CompassIcon } from "@phosphor-icons/react/dist/csr/Compass";
import { ClipboardTextIcon } from "@phosphor-icons/react/dist/csr/ClipboardText";
import { HandCoinsIcon } from "@phosphor-icons/react/dist/csr/HandCoins";
import { AirplaneIcon } from "@phosphor-icons/react/dist/csr/Airplane";
import { StampIcon } from "@phosphor-icons/react/dist/csr/Stamp";
import { ShieldCheckIcon } from "@phosphor-icons/react/dist/csr/ShieldCheck";

import { AddressesSection } from "../../../addresses/AddressesSection";
import { ProfileImagePanel } from "../../../addresses/profile-image";
import { IdentityDocumentsSection } from "../../../identity/identity-documents/IdentityDocumentsSection";
import { EvidenceMediaSection } from "../../../identity/media/EvidenceMediaSection";
import { EducationsSection } from "../../../education/educations";
import { LanguageTestsSection } from "../../../education/language-tests";
import { TrainingsSection } from "../../../education/trainings";
import { SkillsSection } from "../../../education/skills";
import { LanguagesSection } from "../../../education/languages";
import { AcademicGradingsSection } from "../../../education/academic-gradings";
import { FamilyMembersSection } from "../../../family/family-members";
import { EmergencyContactsSection } from "../../../family/emergency-contacts";
import { ReferencesSection } from "../../../family/references";
import { InterestProfilePanel } from "../../../interests/interest-profile/InterestProfilePanel";
import { AssessmentsSection } from "../../../interests/qualification-assessments/AssessmentsSection";
import { InteractionsSection } from "../../../crm/interactions";
import { SponsorsSection } from "../../../crm/sponsors";
import { TravelHistorySection } from "../../../crm/travel-history";
import { VisaHistorySection } from "../../../crm/visa-history";
import { ConsentsSection } from "../../../crm/consents";
import { CasesSection } from "../../../cases/CasesSection";
import { AssignmentsSection } from "../../../assignments/AssignmentsSection";
import { HistorySection } from "./HistorySection";
import type { SectionContentProps } from "./SectionContent.types";

/** A child section that lists/CRUDs one resource for the current applicant. */
type SectionComponent = ComponentType<{ applicantId: string }>;

interface SubTab {
  value: string;
  label: string;
  icon: Icon;
  Component: SectionComponent;
}

/** Sub-tab maps mirror each detail page's own composition (order + labels + icons). */
const SUB_TABS: Partial<Record<string, SubTab[]>> = {
  identity: [
    {
      value: "documents",
      label: "Identity documents",
      icon: IdentificationCardIcon,
      Component: IdentityDocumentsSection,
    },
    {
      value: "media",
      label: "Evidence media",
      icon: FilesIcon,
      Component: EvidenceMediaSection,
    },
  ],
  education: [
    {
      value: "educations",
      label: "Education",
      icon: GraduationCapIcon,
      Component: EducationsSection,
    },
    {
      value: "language-tests",
      label: "Language tests",
      icon: CertificateIcon,
      Component: LanguageTestsSection,
    },
    {
      value: "trainings",
      label: "Trainings",
      icon: SparkleIcon,
      Component: TrainingsSection,
    },
    {
      value: "skills",
      label: "Skills",
      icon: ChatCircleTextIcon,
      Component: SkillsSection,
    },
    {
      value: "languages",
      label: "Languages",
      icon: TranslateIcon,
      Component: LanguagesSection,
    },
    {
      value: "academic-gradings",
      label: "Academic gradings",
      icon: ChartBarIcon,
      Component: AcademicGradingsSection,
    },
  ],
  family: [
    {
      value: "family-members",
      label: "Family members",
      icon: UsersThreeIcon,
      Component: FamilyMembersSection,
    },
    {
      value: "emergency-contacts",
      label: "Emergency contacts",
      icon: LifebuoyIcon,
      Component: EmergencyContactsSection,
    },
    {
      value: "references",
      label: "References",
      icon: AddressBookIcon,
      Component: ReferencesSection,
    },
  ],
  interests: [
    {
      value: "profile",
      label: "Interest profile",
      icon: CompassIcon,
      Component: InterestProfilePanel,
    },
    {
      value: "assessments",
      label: "Assessments",
      icon: ClipboardTextIcon,
      Component: AssessmentsSection,
    },
  ],
  crm: [
    {
      value: "interactions",
      label: "Interactions",
      icon: ChatCircleTextIcon,
      Component: InteractionsSection,
    },
    {
      value: "sponsors",
      label: "Sponsors",
      icon: HandCoinsIcon,
      Component: SponsorsSection,
    },
    {
      value: "travel-history",
      label: "Travel history",
      icon: AirplaneIcon,
      Component: TravelHistorySection,
    },
    {
      value: "visa-history",
      label: "Visa history",
      icon: StampIcon,
      Component: VisaHistorySection,
    },
    {
      value: "consents",
      label: "Consents",
      icon: ShieldCheckIcon,
      Component: ConsentsSection,
    },
  ],
};

function SubTabs({
  tabs,
  applicantId,
}: {
  tabs: SubTab[];
  applicantId: string;
}) {
  return (
    <Tabs defaultValue={tabs[0].value} keepMounted={false} variant="pills">
      <Tabs.List mb="md">
        {tabs.map((t) => (
          <Tabs.Tab
            key={t.value}
            value={t.value}
            leftSection={<t.icon size={15} aria-hidden />}
          >
            {t.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Panel key={t.value} value={t.value}>
          <t.Component applicantId={applicantId} />
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}

/**
 * Renders one detail section's content inside the profile modal — the same child CRUD
 * surfaces the routes use, hosted in-place instead of navigated to. `overview` is handled
 * by the modal directly; everything else resolves here (sub-tabbed or single).
 */
export function SectionContent({
  sectionId,
  applicant,
  isAdmin,
}: SectionContentProps): ReactNode {
  const applicantId = applicant.id;
  const subTabs = SUB_TABS[sectionId];
  if (subTabs) return <SubTabs tabs={subTabs} applicantId={applicantId} />;

  switch (sectionId) {
    case "addresses": {
      // Staff can't edit a locked record; nobody edits an archived one.
      const uploadDisabled =
        Boolean(applicant.archived_at) || (applicant.is_locked && !isAdmin);
      return (
        <Stack gap="md">
          <ProfileImagePanel
            applicantId={applicantId}
            disabled={uploadDisabled}
          />
          <AddressesSection applicantId={applicantId} />
        </Stack>
      );
    }
    case "cases":
      return <CasesSection applicantId={applicantId} />;
    case "assignments":
      return <AssignmentsSection applicantId={applicantId} />;
    case "history":
      return <HistorySection applicantId={applicantId} />;
    default:
      return null;
  }
}
