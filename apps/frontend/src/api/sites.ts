import axios from 'axios';
import type {
  Site,
  CreateSiteRequest,
  UpdateSiteRequest,
  UpdateSiteNameRequest,
  SiteListItem,
} from '@apha-bst/shared';

export async function createSite(data: CreateSiteRequest): Promise<Site> {
  const response = await axios.post<Site>('/api/sites', data);
  return response.data;
}

export async function getAllSites(): Promise<SiteListItem[]> {
  const response = await axios.get<SiteListItem[]>('/api/sites');
  return response.data;
}

export async function searchSites(params: {
  plant_no?: string;
  name?: string;
}): Promise<SiteListItem[]> {
  const response = await axios.get<SiteListItem[]>('/api/sites/search', {
    params,
  });
  return response.data;
}

export async function getSiteByPlantNo(plantNo: string): Promise<Site> {
  const response = await axios.get<Site>(`/api/sites/${plantNo}`);
  return response.data;
}

export async function updateSite(
  plantNo: string,
  data: UpdateSiteRequest,
): Promise<Site> {
  const response = await axios.patch<Site>(`/api/sites/${plantNo}`, data);
  return response.data;
}

export async function updateSiteName(
  plantNo: string,
  newName: string,
): Promise<Site> {
  const data: UpdateSiteNameRequest = { new_name: newName };
  const response = await axios.patch<Site>(
    `/api/sites/${plantNo}/name`,
    data,
  );
  return response.data;
}

export async function deleteSite(plantNo: string): Promise<void> {
  await axios.delete(`/api/sites/${plantNo}`);
}
