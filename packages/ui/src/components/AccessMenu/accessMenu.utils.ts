import type { AccessLevel } from './AccessMenu.types';

export const ACCESS_LEVEL_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: 'view', label: 'Can view' },
  { value: 'edit', label: 'Can edit' },
  { value: 'manage', label: 'Can manage' },
  { value: 'owner', label: 'Owner' },
];

export function accessLevelLabel(level: AccessLevel): string {
  const match = ACCESS_LEVEL_OPTIONS.find((o) => o.value === level);
  return match?.label.toLowerCase() ?? level;
}
