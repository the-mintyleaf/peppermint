import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchConversations,
  fetchConversation,
  assignConversation,
  resolveConversation,
  reopenConversation,
  replyToConversation,
  type InboxFilters,
} from "./inbox.api";
import { inboxKeys } from "./inbox.queryKeys";

export function useConversations(filters: InboxFilters = {}) {
  return useQuery({
    queryKey: inboxKeys.list(filters),
    queryFn: () => fetchConversations(filters),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: inboxKeys.detail(id),
    queryFn: () => fetchConversation(id),
    enabled: !!id,
  });
}

export function useAssignConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      assignConversation(id, assignedTo),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inboxKeys.lists() });
      qc.setQueryData(inboxKeys.detail(data.id), data);
    },
  });
}

export function useResolveConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resolveConversation,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inboxKeys.lists() });
      qc.setQueryData(inboxKeys.detail(data.id), data);
    },
  });
}

export function useReopenConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reopenConversation,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: inboxKeys.lists() });
      qc.setQueryData(inboxKeys.detail(data.id), data);
    },
  });
}

export function useReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      text,
      type,
    }: {
      id: string;
      text: string;
      type?: "reply" | "internal_note";
    }) => replyToConversation(id, text, type),
    onSuccess: (data) => {
      qc.setQueryData(inboxKeys.detail(data.id), data);
    },
  });
}
