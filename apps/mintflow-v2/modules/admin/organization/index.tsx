import { OrgHome } from "./organization-unit/pages/home";
import { OrgUnitList } from "./organization-unit/pages/list";
import { OrgUnitNew } from "./organization-unit/pages/new";
import { OrgUnitEdit } from "./organization-unit/pages/edit";
import { OrgUnitViewPage } from "./organization-unit/pages/view";
import { OrgUnitArchived } from "./organization-unit/pages/archived";

export const ModuleOrganization = {
  main: OrgUnitList,
  home: OrgHome,
  new: OrgUnitNew,
  edit: OrgUnitEdit,
  view: OrgUnitViewPage,
  archived: OrgUnitArchived,
};
