import type { ReactNode } from "react";
import type { ApplicantSectionId } from "./sections";

export interface ApplicantDetailShellProps {
  applicantId: string;
  /** The section this page renders — drives nav highlighting + breadcrumb. */
  activeSection: ApplicantSectionId;
  /** Section content. */
  children: ReactNode;
  /** Optional right-aligned header actions (edit / transition / lock / merge). */
  headerActions?: ReactNode;
}
