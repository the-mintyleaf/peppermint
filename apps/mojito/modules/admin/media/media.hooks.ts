import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMedia,
  fetchFolders,
  uploadMedia,
  updateMedia,
  deleteMedia,
  bulkDeleteMedia,
  createFolder,
  deleteFolder,
  type MediaFilters,
} from "./media.api";
import { mediaKeys } from "./media.queryKeys";

export function useMedia(filters: MediaFilters = {}) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => fetchMedia(filters),
  });
}

export function useFolders() {
  return useQuery({
    queryKey: mediaKeys.folders(),
    queryFn: fetchFolders,
  });
}

export function useUploadMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string }) =>
      uploadMedia(file, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.lists() }),
  });
}

export function useUpdateMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateMedia>[1] }) =>
      updateMedia(id, patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.lists() }),
  });
}

export function useDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMedia,
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.lists() }),
  });
}

export function useBulkDeleteMedia() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bulkDeleteMedia,
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.lists() }),
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      createFolder(name, parentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.folders() }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => qc.invalidateQueries({ queryKey: mediaKeys.folders() }),
  });
}
