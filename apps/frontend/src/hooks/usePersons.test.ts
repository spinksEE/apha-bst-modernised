import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from 'react';
import {
  usePersonsBySite,
  usePerson,
  useCreatePerson,
  useUpdatePerson,
  useDeletePerson,
  useCheckDuplicate,
} from './usePersons';
import type { Person, DuplicateCheckResult } from '@apha-bst/shared';

vi.mock('../api/persons');

import {
  getPersons,
  getPersonById,
  createPerson,
  updatePerson,
  deletePerson,
  checkDuplicate,
} from '../api/persons';

const mockedGetPersons = vi.mocked(getPersons);
const mockedGetPersonById = vi.mocked(getPersonById);
const mockedCreatePerson = vi.mocked(createPerson);
const mockedUpdatePerson = vi.mocked(updatePerson);
const mockedDeletePerson = vi.mocked(deletePerson);
const mockedCheckDuplicate = vi.mocked(checkDuplicate);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

const personDetail: Person = {
  person_id: 1,
  first_name: 'John',
  last_name: 'Smith',
  display_name: 'Smith, John',
  site_id: 'UK001',
  has_training: false,
};

describe('usePersons hooks', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('usePersonsBySite', () => {
    it('fetches persons for a given site', async () => {
      mockedGetPersons.mockResolvedValue([personDetail]);
      const { result } = renderHook(
        () => usePersonsBySite('UK001'),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([personDetail]);
      expect(mockedGetPersons).toHaveBeenCalledWith('UK001');
    });

    it('does not fetch when siteId is null', () => {
      const { result } = renderHook(
        () => usePersonsBySite(null),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedGetPersons).not.toHaveBeenCalled();
    });
  });

  describe('usePerson', () => {
    it('fetches person by id', async () => {
      mockedGetPersonById.mockResolvedValue(personDetail);
      const { result } = renderHook(
        () => usePerson(1),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(personDetail);
      expect(mockedGetPersonById).toHaveBeenCalledWith(1);
    });

    it('does not fetch when id is null', () => {
      const { result } = renderHook(
        () => usePerson(null),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedGetPersonById).not.toHaveBeenCalled();
    });
  });

  describe('useCreatePerson', () => {
    it('calls createPerson API', async () => {
      mockedCreatePerson.mockResolvedValue(personDetail);
      const { result } = renderHook(() => useCreatePerson(), { wrapper: createWrapper() });

      result.current.mutate({
        first_name: 'John',
        last_name: 'Smith',
        site_id: 'UK001',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedCreatePerson).toHaveBeenCalled();
      expect(mockedCreatePerson.mock.calls[0][0]).toEqual({
        first_name: 'John',
        last_name: 'Smith',
        site_id: 'UK001',
      });
    });
  });

  describe('useUpdatePerson', () => {
    it('calls updatePerson API with id and data', async () => {
      const updated = { ...personDetail, last_name: 'Jones', display_name: 'Jones, John' };
      mockedUpdatePerson.mockResolvedValue(updated);
      const { result } = renderHook(() => useUpdatePerson(), { wrapper: createWrapper() });

      result.current.mutate({ id: 1, data: { last_name: 'Jones' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedUpdatePerson).toHaveBeenCalledWith(1, { last_name: 'Jones' });
    });
  });

  describe('useDeletePerson', () => {
    it('calls deletePerson API', async () => {
      mockedDeletePerson.mockResolvedValue(undefined);
      const { result } = renderHook(() => useDeletePerson(), { wrapper: createWrapper() });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockedDeletePerson).toHaveBeenCalled();
      expect(mockedDeletePerson.mock.calls[0][0]).toBe(1);
    });
  });

  describe('useCheckDuplicate', () => {
    it('checks for duplicates when all params provided', async () => {
      const dupResult: DuplicateCheckResult = {
        isDuplicate: true,
        existing: [personDetail],
      };
      mockedCheckDuplicate.mockResolvedValue(dupResult);
      const { result } = renderHook(
        () => useCheckDuplicate('John', 'Smith', 'UK001'),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(dupResult);
      expect(mockedCheckDuplicate).toHaveBeenCalledWith('John', 'Smith', 'UK001');
    });

    it('does not fetch when params are empty', () => {
      const { result } = renderHook(
        () => useCheckDuplicate('', '', ''),
        { wrapper: createWrapper() },
      );

      expect(result.current.fetchStatus).toBe('idle');
      expect(mockedCheckDuplicate).not.toHaveBeenCalled();
    });
  });
});
