export interface User {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  roles: string[];
}

export interface UserInfoPopoverProps {
  variant?: "default" | "icon";
  user?: User | null;
  onLogout?: () => void;
  disableSetAway?: boolean;
  disablePauseNotifications?: boolean;
  disableHelp?: boolean;
  disableSettings?: boolean;
  disableTheme?: boolean;
}
