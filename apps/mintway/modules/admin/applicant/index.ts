import { AddressesPage } from "./addresses";
import { ApplicantsList, ApplicantOverview } from "./applicants";
import { CrmPage } from "./crm";
import { EducationPage } from "./education";
import { FamilyPage } from "./family";
import { HistoryPage } from "./history";
import { IdentityPage } from "./identity";
import { InterestsPage } from "./interests";

/**
 * Applicant CRM module group. Each key is a route target re-exported by a thin `app/`
 * page. Detail sections (identity, education, crm, cases, …) are added as they land.
 */
export const ModuleApplicant = {
  main: ApplicantsList,
  overview: ApplicantOverview,
  addresses: AddressesPage,
  identity: IdentityPage,
  education: EducationPage,
  family: FamilyPage,
  interests: InterestsPage,
  crm: CrmPage,
  history: HistoryPage,
};
