import axios from 'axios';
import type {
  Training,
  TrainingListItem,
  CreateTrainingRequest,
  UpdateTrainingRequest,
} from '@apha-bst/shared';

export async function getTrainingsByTrainee(
  traineeId: number,
): Promise<TrainingListItem[]> {
  const response = await axios.get<TrainingListItem[]>(
    '/api/trainings/by-trainee',
    { params: { trainee_id: traineeId } },
  );
  return response.data;
}

export async function getTrainingById(id: number): Promise<Training> {
  const response = await axios.get<Training>(`/api/trainings/${id}`);
  return response.data;
}

export async function createTraining(
  data: CreateTrainingRequest,
): Promise<Training> {
  const response = await axios.post<Training>('/api/trainings', data);
  return response.data;
}

export async function updateTraining(
  id: number,
  data: UpdateTrainingRequest,
): Promise<Training> {
  const response = await axios.patch<Training>(`/api/trainings/${id}`, data);
  return response.data;
}

export async function deleteTraining(id: number): Promise<void> {
  await axios.delete(`/api/trainings/${id}`);
}
