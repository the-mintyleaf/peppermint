import {
  notifications,
  useMutation,
  useQuery,
  useQueryClient,
} from "@peppermint/ui";

import { getApiErrorMessage } from "@/lib/authErrorMessages";

import {
  acceptMembership,
  declineMembership,
  fetchMyMemberships,
} from "./Invitations.api";
import { invitationsQueryKeys } from "./Invitations.queryKeys";

const PENDING_STATUS = "invited" as const;

export function useMyInvitations() {
  return useQuery({
    queryKey: invitationsQueryKeys.mine(PENDING_STATUS),
    queryFn: () => fetchMyMemberships(PENDING_STATUS),
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (membershipId: string) => acceptMembership(membershipId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationsQueryKeys.mine(PENDING_STATUS),
      });
      notifications.show({
        color: "green",
        title: "Invitation accepted",
        message: "You've joined the organization.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't accept invitation",
        message: getApiErrorMessage(error),
      });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      membershipId,
      reason,
    }: {
      membershipId: string;
      reason?: string;
    }) => declineMembership(membershipId, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: invitationsQueryKeys.mine(PENDING_STATUS),
      });
      notifications.show({
        color: "green",
        title: "Invitation declined",
        message: "The invitation has been declined.",
      });
    },
    onError: (error) => {
      notifications.show({
        color: "red",
        title: "Couldn't decline invitation",
        message: getApiErrorMessage(error),
      });
    },
  });
}
