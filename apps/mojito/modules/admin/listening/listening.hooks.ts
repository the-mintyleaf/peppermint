import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMentions,
  fetchKeywords,
  addKeyword,
  deleteKeyword,
  fetchCompetitors,
  addCompetitor,
  deleteCompetitor,
  fetchSentimentStream,
  fetchAlerts,
  markAlertRead,
  markAllAlertsRead,
  type MentionFilters,
} from "./listening.api";
import { listeningKeys } from "./listening.queryKeys";

export function useMentions(filters: MentionFilters = {}) {
  return useQuery({
    queryKey: listeningKeys.mentions(filters),
    queryFn: () => fetchMentions(filters),
  });
}

export function useKeywords() {
  return useQuery({
    queryKey: listeningKeys.keywords(),
    queryFn: fetchKeywords,
  });
}

export function useAddKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      term,
      kind,
    }: {
      term: string;
      kind: "keyword" | "hashtag";
    }) => addKeyword(term, kind),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: listeningKeys.keywords() }),
  });
}

export function useDeleteKeyword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteKeyword,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: listeningKeys.keywords() }),
  });
}

export function useCompetitors() {
  return useQuery({
    queryKey: listeningKeys.competitors(),
    queryFn: fetchCompetitors,
  });
}

export function useAddCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ handle, platform }: { handle: string; platform: string }) =>
      addCompetitor(handle, platform as any),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: listeningKeys.competitors() }),
  });
}

export function useDeleteCompetitor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCompetitor,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: listeningKeys.competitors() }),
  });
}

export function useSentimentStream() {
  return useQuery({
    queryKey: listeningKeys.sentiment(),
    queryFn: fetchSentimentStream,
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: listeningKeys.alerts(),
    queryFn: fetchAlerts,
    refetchInterval: 60_000,
  });
}

export function useMarkAlertRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAlertRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: listeningKeys.alerts() }),
  });
}

export function useMarkAllAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAlertsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: listeningKeys.alerts() }),
  });
}
