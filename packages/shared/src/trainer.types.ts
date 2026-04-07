export interface Trainer {
  trainer_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  location_id: string;
  person_id: number | null;
}

export interface TrainerListItem {
  trainer_id: number;
  display_name: string;
  location_id: string;
  person_id: number | null;
}

export interface CreateTrainerRequest {
  first_name: string;
  last_name: string;
  location_id: string;
  person_id?: number;
}
