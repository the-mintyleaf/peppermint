import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchLinkInBioPage,
  updateLinkInBioPage,
  updateLinks,
  publishPage,
  type LinkInBioPage,
  type LinkItem,
} from "./linkInBio.api";
import { linkInBioKeys } from "./linkInBio.queryKeys";

export function useLinkInBioPage() {
  return useQuery({
    queryKey: linkInBioKeys.page(),
    queryFn: fetchLinkInBioPage,
  });
}

export function useUpdateLinkInBioPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Omit<LinkInBioPage, "links">>) =>
      updateLinkInBioPage(patch),
    onSuccess: (data) => qc.setQueryData(linkInBioKeys.page(), data),
  });
}

export function useUpdateLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (links: LinkItem[]) => updateLinks(links),
    onSuccess: (data) => qc.setQueryData(linkInBioKeys.page(), data),
  });
}

export function usePublishLinkInBio() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: publishPage,
    onSuccess: (data) => qc.setQueryData(linkInBioKeys.page(), data),
  });
}
