import type { AccessLevel } from "./AccessMenu.types";

export const ACCESS_LEVEL_OPTIONS: {
  value: AccessLevel;
  label: string;
  shortLabel: string;
}[] = [
  { value: "view", label: "Can view", shortLabel: "View" },
  { value: "edit", label: "Can edit", shortLabel: "Edit" },
  { value: "manage", label: "Can manage", shortLabel: "Manage" },
  { value: "owner", label: "Owner", shortLabel: "Owner" },
];

export function accessLevelLabel(level: AccessLevel): string {
  const match = ACCESS_LEVEL_OPTIONS.find((o) => o.value === level);
  return match?.label.toLowerCase() ?? level;
}
