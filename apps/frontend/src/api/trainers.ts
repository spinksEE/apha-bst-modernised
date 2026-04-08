import axios from 'axios';
import type { Trainer, CreateTrainerRequest } from '@apha-bst/shared';

export async function getTrainers(): Promise<Trainer[]> {
  const response = await axios.get<Trainer[]>('/api/trainers');
  return response.data;
}

export async function createTrainer(data: CreateTrainerRequest): Promise<Trainer> {
  const response = await axios.post<Trainer>('/api/trainers', data);
  return response.data;
}

export async function deleteTrainer(id: number): Promise<void> {
  await axios.delete(`/api/trainers/${id}`);
}
