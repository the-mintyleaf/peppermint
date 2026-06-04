import type { AdminShellHeaderConfig } from "@zetsel/admin";
import { CheckCircle as CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { Bell as BellIcon } from "@phosphor-icons/react/dist/csr/Bell";

export const adminHeaderConfig: AdminShellHeaderConfig = {
  adminName: "Anamol",
  greeting: "Hello Anamol!\nLet's begin your day!",
  actionButtons: [
    {
      label: "TODOs",
      badgeCount: 12,
      color: "indigo",
      icon: CheckCircleIcon,
      onClick: () => {
        console.log("Navigate to TODOs");
      },
    },
    {
      label: "Notifications",
      badgeCount: 3,
      color: "blue",
      icon: BellIcon,
      onClick: () => {
        console.log("Navigate to Notifications");
      },
    },
  ],
};
