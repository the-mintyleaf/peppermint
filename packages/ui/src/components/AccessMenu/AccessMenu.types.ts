export type AccessLevel = 'view' | 'edit' | 'manage' | 'owner';

export interface AccessAccount {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  accessLevel: AccessLevel;
}

export interface AccessRole {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
  accessLevel: AccessLevel;
}

export interface AccessMenuData {
  accounts: AccessAccount[];
  roles: AccessRole[];
  invitedCount?: number;
}

export interface AccessMenuChange {
  type: 'invite' | 'account' | 'role';
  accountId?: string;
  roleId?: string;
  accessLevel: AccessLevel;
  inviteQuery?: string;
}

export interface AccessMenuProps {
  data: AccessMenuData;
  onChange?: (change: AccessMenuChange) => void;
  shareUrl?: string;
  label?: string;
  width?: number;
}
