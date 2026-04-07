import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import type {
  Person,
  CreatePersonRequest,
  UpdatePersonRequest,
  DuplicateCheckResult,
} from '@apha-bst/shared';
import {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  checkDuplicate,
} from '../api/persons';

const PERSONS_KEY = ['persons'] as const;
const SITES_KEY = ['sites'] as const;

export function usePersonsBySite(siteId: string | null) {
  return useQuery<Person[]>({
    queryKey: [...PERSONS_KEY, 'bySite', siteId],
    queryFn: () => getPersons(siteId!),
    enabled: Boolean(siteId),
  });
}

export function usePerson(id: number | null) {
  return useQuery<Person>({
    queryKey: [...PERSONS_KEY, 'detail', id],
    queryFn: () => getPersonById(id!),
    enabled: id !== null,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation<Person, Error, CreatePersonRequest>({
    mutationFn: createPerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation<Person, Error, { id: number; data: UpdatePersonRequest }>({
    mutationFn: ({ id, data }) => updatePerson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: deletePerson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONS_KEY });
      queryClient.invalidateQueries({ queryKey: SITES_KEY });
    },
  });
}

export function useCheckDuplicate(
  firstName: string,
  lastName: string,
  siteId: string,
) {
  const enabled =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    siteId.trim().length > 0;

  return useQuery<DuplicateCheckResult>({
    queryKey: [...PERSONS_KEY, 'duplicate', firstName, lastName, siteId],
    queryFn: () => checkDuplicate(firstName, lastName, siteId),
    enabled,
  });
}
