export interface PersonPositionChipProps {
  personName: string;
  positionTitle: string;
  unitName?: string;
  employeeCode?: string;
  avatarUrl?: string;
  size?: "sm" | "md";
  onClick?: () => void;
}
