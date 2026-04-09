import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import {
  useTrainingsByTrainee,
  useTraining,
  useCreateTraining,
  useUpdateTraining,
  useDeleteTraining,
} from './useTraining';
import type { Training, TrainingListItem } from '@apha-bst/shared';

vi.mock('../api/training');

import {
  getTrainingsByTrainee,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} from '../api/training';

const mockedGetTrainingsByTrainee = vi.mocked(getTrainingsByTrainee);
const mockedGetTrainingById = vi.mocked(getTrainingById);
const mockedCreateTraining = vi.mocked(createTraining);
const mockedUpdateTraining = vi.mocked(updateTraining);
const mockedDeleteTraining = vi.mocked(deleteTraining);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const trainingListItem: TrainingListItem = {
  training_id: 1,
  date_trained: '2026-03-15',
  training_type: 'Trained',
  species_trained: ['Cattle', 'Sheep'],
  trainer_display_name: 'Reed, Catherine',
};

const trainingDetail: Training = {
  training_id: 1,
  trainee_id: 10,
  trainer_id: 1,
  date_trained: '2026-03-15',
  species_trained: ['Cattle', 'Sheep'],
  training_type: 'Trained',
  trainer_display_name: 'Reed, Catherine',
  trainee_display_name: 'Wilson, James',
};

describe('useTraining hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('useTrainingsByTrainee', () => {
    it('fetches trainings for a given trainee', async () => {
      mockedGetTrainingsByTrainee.mockResolvedValue([trainingListItem]);
      const { result } = renderHook(
        () => useTrainingsByTrainee(10),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([trainingListItem]);
      expect(mockedGetTrainingsByTrainee).toHaveBeenCalledWith(10);
    });

    it('does not fetch when traineeId is null', () => {
      const { result } = renderHook(
        () => useTrainingsByTrainee(null),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedGetTrainingsByTrainee).not.toHaveBeenCalled();
    });
  });

  describe('useTraining', () => {
    it('fetches training by id', async () => {
      mockedGetTrainingById.mockResolvedValue(trainingDetail);
      const { result } = renderHook(
        () => useTraining(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(trainingDetail);
      expect(mockedGetTrainingById).toHaveBeenCalledWith(1);
    });

    it('does not fetch when id is null', () => {
      const { result } = renderHook(
        () => useTraining(null),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedGetTrainingById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateTraining', () => {
    it('calls createTraining API', async () => {
      mockedCreateTraining.mockResolvedValue(trainingDetail);
      const { result } = renderHook(() => useCreateTraining(), { wrapper: createWrapper() });

      result.current.mutate({
        trainee_id: 10,
        trainer_id: 1,
        date_trained: '2026-03-15',
        species_trained: ['Cattle', 'Sheep'],
        training_type: 'Trained',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCreateTraining).toHaveBeenCalled();
      expect(mockedCreateTraining.mock.calls[0][0]).toEqual({
        trainee_id: 10,
        trainer_id: 1,
        date_trained: '2026-03-15',
        species_trained: ['Cattle', 'Sheep'],
        training_type: 'Trained',
      });
    });
  });

  describe('useUpdateTraining', () => {
    it('calls updateTraining API with id and data', async () => {
      const updated = { ...trainingDetail, training_type: 'CascadeTrained' as const };
      mockedUpdateTraining.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdateTraining(), { wrapper: createWrapper() });

      result.current.mutate({ id: 1, data: { training_type: 'CascadeTrained' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUpdateTraining).toHaveBeenCalledWith(1, { training_type: 'CascadeTrained' });
    });
  });

  describe('useDeleteTraining', () => {
    it('calls deleteTraining API', async () => {
      mockedDeleteTraining.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDeleteTraining(), { wrapper: createWrapper() });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedDeleteTraining).toHaveBeenCalled();
      expect(mockedDeleteTraining.mock.calls[0][0]).toBe(1);
    });
  });
});
