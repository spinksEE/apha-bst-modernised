import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type { Trainer, CreateTrainerRequest } from '@apha-bst/shared';
import { getTrainers, createTrainer, deleteTrainer } from '../api/trainers';

const TRAINERS_KEY = ['trainers'] as const;

export function useTrainers() {
  return useQuery<Trainer[]>({
    queryKey: [...TRAINERS_KEY, 'list'],
    queryFn: getTrainers,
  });
}

export function useCreateTrainer() {
  const queryClient = useQueryClient();
  return useMutation<Trainer, Error, CreateTrainerRequest>({
    mutationFn: createTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINERS_KEY });
    },
  });
}

export function useDeleteTrainer() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteTrainer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINERS_KEY });
    },
  });
}
