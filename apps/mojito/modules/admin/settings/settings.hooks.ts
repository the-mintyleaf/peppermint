import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUserProfile,
  updateUserProfile,
  fetchWorkspace,
  updateWorkspace,
  fetchTeamMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  fetchNotificationPrefs,
  updateNotificationPrefs,
  fetchIntegrations,
  connectIntegration,
  disconnectIntegration,
  fetchBillingInfo,
  type UserProfile,
  type Workspace,
  type TeamMember,
  type NotificationPrefs,
} from "./settings.api";
import { settingsKeys } from "./settings.queryKeys";

export function useUserProfile() {
  return useQuery({ queryKey: settingsKeys.profile(), queryFn: fetchUserProfile });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<UserProfile>) => updateUserProfile(patch),
    onSuccess: (data) => qc.setQueryData(settingsKeys.profile(), data),
  });
}

export function useWorkspace() {
  return useQuery({ queryKey: settingsKeys.workspace(), queryFn: fetchWorkspace });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Workspace>) => updateWorkspace(patch),
    onSuccess: (data) => qc.setQueryData(settingsKeys.workspace(), data),
  });
}

export function useTeamMembers() {
  return useQuery({ queryKey: settingsKeys.team(), queryFn: fetchTeamMembers });
}

export function useInviteMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: TeamMember["role"] }) =>
      inviteMember(email, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.team() }),
  });
}

export function useUpdateMemberRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: TeamMember["role"] }) =>
      updateMemberRole(id, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.team() }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.team() }),
  });
}

export function useNotificationPrefs() {
  return useQuery({ queryKey: settingsKeys.notifPrefs(), queryFn: fetchNotificationPrefs });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<NotificationPrefs>) => updateNotificationPrefs(patch),
    onSuccess: (data) => qc.setQueryData(settingsKeys.notifPrefs(), data),
  });
}

export function useIntegrations() {
  return useQuery({ queryKey: settingsKeys.integrations(), queryFn: fetchIntegrations });
}

export function useConnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: connectIntegration,
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.integrations() }),
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: disconnectIntegration,
    onSuccess: () => qc.invalidateQueries({ queryKey: settingsKeys.integrations() }),
  });
}

export function useBillingInfo() {
  return useQuery({ queryKey: settingsKeys.billing(), queryFn: fetchBillingInfo });
}
