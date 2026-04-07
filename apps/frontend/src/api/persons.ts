import axios from 'axios';
import type {
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
  DuplicateCheckResult,
} from '@apha-bst/shared';

export async function getPersons(siteId?: string, name?: string): Promise<Person[]> {
  const params: Record<string, string> = {};
  if (siteId) params.site_id = siteId;
  if (name) params.name = name;
  const response = await axios.get<Person[]>('/api/persons', { params });
  return response.data;
}

export async function getPersonById(id: number): Promise<Person> {
  const response = await axios.get<Person>(`/api/persons/${id}`);
  return response.data;
}

export async function createPerson(data: CreatePersonRequest): Promise<Person> {
  const response = await axios.post<Person>('/api/persons', data);
  return response.data;
}

export async function updatePerson(
  id: number,
  data: UpdatePersonRequest,
): Promise<Person> {
  const response = await axios.patch<Person>(`/api/persons/${id}`, data);
  return response.data;
}

export async function deletePerson(id: number): Promise<void> {
  await axios.delete(`/api/persons/${id}`);
}

export async function checkDuplicate(
  firstName: string,
  lastName: string,
  siteId: string,
): Promise<DuplicateCheckResult> {
  const response = await axios.get<DuplicateCheckResult>(
    '/api/persons/check-duplicate',
    { params: { first_name: firstName, last_name: lastName, site_id: siteId } },
  );
  return response.data;
}
