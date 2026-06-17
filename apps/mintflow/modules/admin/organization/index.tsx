import { OrgHome } from "./pages/home";
import { OrgUnitList } from "./pages/list";
import { OrgUnitNew } from "./pages/new";
import { OrgUnitEdit } from "./pages/edit";
import { OrgUnitViewPage } from "./pages/view";
import { OrgUnitArchived } from "./pages/archived";

export const ModuleOrganization = {
  main: OrgUnitList,
  home: OrgHome,
  new: OrgUnitNew,
  edit: OrgUnitEdit,
  view: OrgUnitViewPage,
  archived: OrgUnitArchived,
};
