import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import { useTrainers, useCreateTrainer, useDeleteTrainer } from './useTrainers';
import type { Trainer } from '@apha-bst/shared';

vi.mock('../api/trainers');

import { getTrainers, createTrainer, deleteTrainer } from '../api/trainers';

const mockedGetTrainers = vi.mocked(getTrainers);
const mockedCreateTrainer = vi.mocked(createTrainer);
const mockedDeleteTrainer = vi.mocked(deleteTrainer);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const trainerDetail: Trainer = {
  trainer_id: 1,
  first_name: 'Catherine',
  last_name: 'Reed',
  display_name: 'Reed, Catherine',
  location_id: 'APHA001',
  person_id: null,
};

describe('useTrainers hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useTrainers', () => {
    it('fetches all trainers', async () => {
      mockedGetTrainers.mockResolvedValue([trainerDetail]);
      const { result } = renderHook(() => useTrainers(), { wrapper: createWrapper() });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([trainerDetail]);
      expect(mockedGetTrainers).toHaveBeenCalledOnce();
    });
  });

  describe('useCreateTrainer', () => {
    it('calls createTrainer API', async () => {
      mockedCreateTrainer.mockResolvedValue(trainerDetail);
      const { result } = renderHook(() => useCreateTrainer(), { wrapper: createWrapper() });

      result.current.mutate({
        first_name: 'Catherine',
        last_name: 'Reed',
        location_id: 'APHA001',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCreateTrainer).toHaveBeenCalled();
      expect(mockedCreateTrainer.mock.calls[0][0]).toEqual({
        first_name: 'Catherine',
        last_name: 'Reed',
        location_id: 'APHA001',
      });
    });
  });

  describe('useDeleteTrainer', () => {
    it('calls deleteTrainer API', async () => {
      mockedDeleteTrainer.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDeleteTrainer(), { wrapper: createWrapper() });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedDeleteTrainer).toHaveBeenCalled();
      expect(mockedDeleteTrainer.mock.calls[0][0]).toBe(1);
    });
  });
});
