import type { AdminShellHeaderConfig } from "@zetsel/admin";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/csr/Bell";

export const adminHeaderConfig: AdminShellHeaderConfig = {
  adminName: "Consultancy",
  greeting: "Hello!\nLet's manage your students today.",
  actionButtons: [
    {
      label: "Tasks",
      badgeCount: 5,
      color: "indigo",
      icon: CheckCircleIcon,
      onClick: () => {
        console.log("Navigate to Tasks");
      },
    },
    {
      label: "Notifications",
      badgeCount: 2,
      color: "blue",
      icon: BellIcon,
      onClick: () => {
        console.log("Navigate to Notifications");
      },
    },
  ],
};
