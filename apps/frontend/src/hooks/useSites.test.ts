import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import {
  useAllSites,
  useSearchSites,
  useSite,
  useCreateSite,
  useUpdateSiteName,
  useUpdateSite,
  useDeleteSite,
} from './useSites';
import type { Site, SiteListItem } from '@apha-bst/shared';

vi.mock('../api/sites');

import {
  getAllSites,
  searchSites,
  getSiteByPlantNo,
  createSite,
  updateSiteName,
  updateSite,
  deleteSite,
} from '../api/sites';

const mockedGetAllSites = vi.mocked(getAllSites);
const mockedSearchSites = vi.mocked(searchSites);
const mockedGetSiteByPlantNo = vi.mocked(getSiteByPlantNo);
const mockedCreateSite = vi.mocked(createSite);
const mockedUpdateSiteName = vi.mocked(updateSiteName);
const mockedUpdateSite = vi.mocked(updateSite);
const mockedDeleteSite = vi.mocked(deleteSite);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const siteList: SiteListItem[] = [
  { plant_no: 'UK001', name: 'Site Alpha' },
  { plant_no: 'UK002', name: 'Site Beta' },
];

const siteDetail: Site = {
  plant_no: 'UK001',
  name: 'Site Alpha',
  address_line_1: '123 Road',
  address_line_2: null,
  address_town: 'Town',
  address_county: null,
  address_post_code: 'AB1 2CD',
  telephone: null,
  fax: null,
  is_apha_site: false,
};

describe('useSites hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useAllSites', () => {
    it('fetches all sites', async () => {
      mockedGetAllSites.mockResolvedValue(siteList);
      const { result } = renderHook(() => useAllSites(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(siteList);
      expect(mockedGetAllSites).toHaveBeenCalledOnce();
    });
  });

  describe('useSearchSites', () => {
    it('searches sites when params provided', async () => {
      mockedSearchSites.mockResolvedValue([siteList[0]]);
      const { result } = renderHook(
        () => useSearchSites({ name: 'Alpha' }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([siteList[0]]);
      expect(mockedSearchSites).toHaveBeenCalledWith({ name: 'Alpha' });
    });

    it('does not fetch when no params provided', () => {
      const { result } = renderHook(
        () => useSearchSites({}),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedSearchSites).not.toHaveBeenCalled();
    });
  });

  describe('useSite', () => {
    it('fetches site by plant number', async () => {
      mockedGetSiteByPlantNo.mockResolvedValue(siteDetail);
      const { result } = renderHook(
        () => useSite('UK001'),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(siteDetail);
      expect(mockedGetSiteByPlantNo).toHaveBeenCalledWith('UK001');
    });

    it('does not fetch when plantNo is null', () => {
      const { result } = renderHook(
        () => useSite(null),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedGetSiteByPlantNo).not.toHaveBeenCalled();
    });
  });

  describe('useCreateSite', () => {
    it('calls createSite API', async () => {
      mockedCreateSite.mockResolvedValue(siteDetail);
      const { result } = renderHook(() => useCreateSite(), { wrapper: createWrapper() });

      result.current.mutate({
        plant_no: 'UK001',
        name: 'Site Alpha',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCreateSite).toHaveBeenCalled();
      expect(mockedCreateSite.mock.calls[0][0]).toEqual({
        plant_no: 'UK001',
        name: 'Site Alpha',
      });
    });
  });

  describe('useUpdateSiteName', () => {
    it('calls updateSiteName API with plantNo and newName', async () => {
      const updated = { ...siteDetail, name: 'New Name [Site Alpha]' };
      mockedUpdateSiteName.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateSiteName(), { wrapper: createWrapper() });

      result.current.mutate({ plantNo: 'UK001', newName: 'New Name' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUpdateSiteName).toHaveBeenCalledWith('UK001', 'New Name');
    });
  });

  describe('useUpdateSite', () => {
    it('calls updateSite API with plantNo and data', async () => {
      const updated = { ...siteDetail, address_line_1: 'New Address' };
      mockedUpdateSite.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateSite(), { wrapper: createWrapper() });

      result.current.mutate({ plantNo: 'UK001', data: { address_line_1: 'New Address' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUpdateSite).toHaveBeenCalledWith('UK001', { address_line_1: 'New Address' });
    });
  });

  describe('useDeleteSite', () => {
    it('calls deleteSite API', async () => {
      mockedDeleteSite.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDeleteSite(), { wrapper: createWrapper() });

      result.current.mutate('UK001');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedDeleteSite).toHaveBeenCalled();
      expect(mockedDeleteSite.mock.calls[0][0]).toBe('UK001');
    });
  });
});
