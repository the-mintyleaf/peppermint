import { AddressesPage } from "./addresses";
import { ApplicantsList, ApplicantOverview } from "./applicants";

/**
 * Applicant CRM module group. Each key is a route target re-exported by a thin `app/`
 * page. Detail sections (identity, education, crm, cases, …) are added as they land.
 */
export const ModuleApplicant = {
  main: ApplicantsList,
  overview: ApplicantOverview,
  addresses: AddressesPage,
};
