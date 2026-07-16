import type { HomeNavIcon } from "../../Home.types";

export interface HomeNavRowProps {
  label: string;
  icon: HomeNavIcon;
  onClick?: () => void;
}
