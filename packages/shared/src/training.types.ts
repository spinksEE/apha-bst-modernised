export type TrainingType = 'Trained' | 'CascadeTrained' | 'TrainingConfirmed';

export type Species = 'Cattle' | 'Sheep' | 'Goat';

export interface Training {
  training_id: number;
  trainee_id: number;
  trainer_id: number;
  date_trained: string;
  species_trained: Species[];
  training_type: TrainingType;
  trainer_display_name: string;
  trainee_display_name: string;
}

export interface TrainingListItem {
  training_id: number;
  date_trained: string;
  training_type: TrainingType;
  species_trained: Species[];
  trainer_display_name: string;
}

export interface CreateTrainingRequest {
  trainee_id: number;
  trainer_id: number;
  date_trained: string;
  species_trained: Species[];
  training_type: TrainingType;
}

export interface UpdateTrainingRequest {
  trainee_id?: number;
  trainer_id?: number;
  date_trained?: string;
  species_trained?: Species[];
  training_type?: TrainingType;
}
