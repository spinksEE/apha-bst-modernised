import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Site, CreateSiteRequest, UpdateSiteRequest, SiteListItem } from '@apha-bst/shared';
import {
  getAllSites,
  searchSites,
  getSiteByPlantNo,
  createSite,
  updateSiteName,
  updateSite,
  deleteSite,
} from '../api/sites';

const SITES_KEY = ['sites'] as const;

export function useAllSites() {
  return useQuery<SiteListItem[]>({
    queryKey: [...SITES_KEY, 'list'],
    queryFn: getAllSites,
  });
}

export function useSearchSites(params: { plant_no?: string; name?: string }) {
  const hasParams = Boolean(params.plant_no || params.name);
  return useQuery<SiteListItem[]>({
    queryKey: [...SITES_KEY, 'search', params],
    queryFn: () => searchSites(params),
    enabled: hasParams,
  });
}

export function useSite(plantNo: string | null) {
  return useQuery<Site>({
    queryKey: [...SITES_KEY, 'detail', plantNo],
    queryFn: () => getSiteByPlantNo(plantNo!),
    enabled: Boolean(plantNo),
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation<Site, Error, CreateSiteRequest>({
    mutationFn: createSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useUpdateSiteName() {
  const queryClient = useQueryClient();
  return useMutation<Site, Error, { plantNo: string; newName: string }>({
    mutationFn: ({ plantNo, newName }) => updateSiteName(plantNo, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  return useMutation<Site, Error, { plantNo: string; data: UpdateSiteRequest }>({
    mutationFn: ({ plantNo, data }) => updateSite(plantNo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}
