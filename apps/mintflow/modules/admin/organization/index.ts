import { ActorContextPreview } from "./actor-context";
import { ModuleDelegations } from "./delegations";
import { ModuleEventLog } from "./event-log";
import { ModuleMembers } from "./members";
import { OrganizationOverview, OrganizationsList } from "./organizations";
import { ModulePositions } from "./positions";
import { ModuleReportingLines } from "./reporting-lines";
import { Structure } from "./structure";

export const ModuleOrganization = {
  main: OrganizationsList,
  overview: OrganizationOverview,
  structure: Structure,
  positions: ModulePositions,
  members: ModuleMembers,
  reportingLines: ModuleReportingLines,
  delegations: ModuleDelegations,
  eventLog: ModuleEventLog,
  actorContext: ActorContextPreview,
};
