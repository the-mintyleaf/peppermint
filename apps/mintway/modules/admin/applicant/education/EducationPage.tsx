"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Tabs } from "@peppermint/ui";
import { GraduationCapIcon } from "@phosphor-icons/react/dist/csr/GraduationCap";
import { TranslateIcon } from "@phosphor-icons/react/dist/csr/Translate";
import { CertificateIcon } from "@phosphor-icons/react/dist/csr/Certificate";
import { SparkleIcon } from "@phosphor-icons/react/dist/csr/Sparkle";
import { ChatCircleTextIcon } from "@phosphor-icons/react/dist/csr/ChatCircleText";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";

import { RequireStaff } from "@/components/RequireStaff";
import { ApplicantDetailShell } from "../_shared";
import { EducationsSection } from "./educations";
import { LanguageTestsSection } from "./language-tests";
import { TrainingsSection } from "./trainings";
import { SkillsSection } from "./skills";
import { LanguagesSection } from "./languages";
import { AcademicGradingsSection } from "./academic-gradings";

const DEFAULT_TAB = "educations";

function EducationPageContent() {
  const { applicantId } = useParams<{ applicantId: string }>();
  const [tab, setTab] = useState<string | null>(DEFAULT_TAB);

  return (
    <ApplicantDetailShell applicantId={applicantId} activeSection="education">
      <Tabs value={tab} onChange={setTab} keepMounted={false} variant="pills">
        <Tabs.List mb="md">
          <Tabs.Tab
            value="educations"
            leftSection={<GraduationCapIcon size={15} aria-hidden />}
          >
            Education
          </Tabs.Tab>
          <Tabs.Tab
            value="language-tests"
            leftSection={<CertificateIcon size={15} aria-hidden />}
          >
            Language tests
          </Tabs.Tab>
          <Tabs.Tab
            value="trainings"
            leftSection={<SparkleIcon size={15} aria-hidden />}
          >
            Trainings
          </Tabs.Tab>
          <Tabs.Tab
            value="skills"
            leftSection={<ChatCircleTextIcon size={15} aria-hidden />}
          >
            Skills
          </Tabs.Tab>
          <Tabs.Tab
            value="languages"
            leftSection={<TranslateIcon size={15} aria-hidden />}
          >
            Languages
          </Tabs.Tab>
          <Tabs.Tab
            value="academic-gradings"
            leftSection={<ChartBarIcon size={15} aria-hidden />}
          >
            Academic gradings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="educations">
          <EducationsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="language-tests">
          <LanguageTestsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="trainings">
          <TrainingsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="skills">
          <SkillsSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="languages">
          <LanguagesSection applicantId={applicantId} />
        </Tabs.Panel>
        <Tabs.Panel value="academic-gradings">
          <AcademicGradingsSection applicantId={applicantId} />
        </Tabs.Panel>
      </Tabs>
    </ApplicantDetailShell>
  );
}

/**
 * Education surface for one applicant (§9) — the admin-only academic profile. Tabs one
 * child-resource CRUD table per section (education, language tests, trainings, skills,
 * languages, academic gradings), all gated behind the admin/superadmin baseline.
 */
export function EducationPage() {
  return (
    <RequireStaff>
      <EducationPageContent />
    </RequireStaff>
  );
}
