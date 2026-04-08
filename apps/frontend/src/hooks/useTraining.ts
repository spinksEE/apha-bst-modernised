import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Training,
  TrainingListItem,
  CreateTrainingRequest,
  UpdateTrainingRequest,
} from '@apha-bst/shared';
import {
  getTrainingsByTrainee,
  getTrainingById,
  createTraining,
  updateTraining,
  deleteTraining,
} from '../api/training';

const TRAINING_KEY = ['training'] as const;
const PERSONS_KEY = ['persons'] as const;

export function useTrainingsByTrainee(traineeId: number | null) {
  return useQuery<TrainingListItem[]>({
    queryKey: [...TRAINING_KEY, 'byTrainee', traineeId],
    queryFn: () => getTrainingsByTrainee(traineeId!),
    enabled: traineeId !== null,
  });
}

export function useTraining(id: number | null) {
  return useQuery<Training>({
    queryKey: [...TRAINING_KEY, 'detail', id],
    queryFn: () => getTrainingById(id!),
    enabled: id !== null,
  });
}

export function useCreateTraining() {
  const queryClient = useQueryClient();
  return useMutation<Training, Error, CreateTrainingRequest>({
    mutationFn: createTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_KEY });
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
    },
  });
}

export function useUpdateTraining() {
  const queryClient = useQueryClient();
  return useMutation<Training, Error, { id: number; data: UpdateTrainingRequest }>({
    mutationFn: ({ id, data }) => updateTraining(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_KEY });
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
    },
  });
}

export function useDeleteTraining() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deleteTraining,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRAINING_KEY });
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
    },
  });
}
