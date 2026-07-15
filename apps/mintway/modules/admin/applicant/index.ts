import { AddressesPage } from "./addresses";
import { ApplicantsList, ApplicantOverview } from "./applicants";
import { EducationPage } from "./education";
import { FamilyPage } from "./family";
import { IdentityPage } from "./identity";

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
};
