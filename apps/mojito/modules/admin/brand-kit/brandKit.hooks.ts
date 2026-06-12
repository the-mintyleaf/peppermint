import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchBrandKit, updateBrandKit, type BrandKit } from "./brandKit.api";
import { brandKitKeys } from "./brandKit.queryKeys";

export function useBrandKit() {
  return useQuery({
    queryKey: brandKitKeys.detail(),
    queryFn: fetchBrandKit,
  });
}

export function useUpdateBrandKit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<BrandKit>) => updateBrandKit(patch),
    onSuccess: (data) => {
      qc.setQueryData(brandKitKeys.detail(), data);
    },
  });
}
