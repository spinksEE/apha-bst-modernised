export interface Person {
  person_id: number;
  first_name: string;
  last_name: string;
  display_name: string;
  site_id: string;
  has_training: boolean;
}

export interface PersonListItem {
  person_id: number;
  display_name: string;
  site_id: string;
  has_training: boolean;
}

export interface CreatePersonRequest {
  first_name: string;
  last_name: string;
  site_id: string;
}

export interface UpdatePersonRequest {
  first_name?: string;
  last_name?: string;
  site_id?: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existing: Person[];
}
