import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditPersonPage } from './EditPersonPage';

vi.mock('../api/sites');
vi.mock('../api/persons');

// Mock usePersons hooks
const mockMutate = vi.fn();
vi.mock('../hooks/usePersons', () => ({
  usePerson: vi.fn(),
  useUpdatePerson: vi.fn(() => ({
    mutate: mockMutate,
    isPending: false,
  })),
}));

vi.mock('../hooks/useSites', () => ({
  useAllSites: vi.fn(() => ({ data: [{ plant_no: 'UK001', name: 'Test Site' }], isLoading: false })),
  useSearchSites: vi.fn(() => ({ data: [], isLoading: false })),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: '1' }) };
});

import { usePerson, useUpdatePerson } from '../hooks/usePersons';
import { useAllSites, useSearchSites } from '../hooks/useSites';

const mockedUsePerson = vi.mocked(usePerson);
const mockedUseUpdatePerson = vi.mocked(useUpdatePerson);
const mockedUseAllSites = vi.mocked(useAllSites);
const mockedUseSearchSites = vi.mocked(useSearchSites);

const mockPerson = {
  person_id: 1,
  first_name: 'John',
  last_name: 'Smith',
  display_name: 'Smith, John',
  site_id: 'UK001',
  has_training: true,
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/persons/1/edit']}>
          <EditPersonPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('EditPersonPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseUpdatePerson.mockReturnValue({ mutate: mockMutate, isPending: false } as ReturnType<typeof useUpdatePerson>);
    mockedUseAllSites.mockReturnValue({ data: [{ plant_no: 'UK001', name: 'Test Site' }], isLoading: false } as ReturnType<typeof useAllSites>);
    mockedUseSearchSites.mockReturnValue({ data: [], isLoading: false } as ReturnType<typeof useSearchSites>);
  });

  it('shows loading state while person data loads', () => {
    mockedUsePerson.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByTestId('edit-loading')).toBeInTheDocument();
  });

  it('shows person not found alert when person is null', () => {
    mockedUsePerson.mockReturnValue({ data: null, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByTestId('person-not-found')).toBeInTheDocument();
    expect(screen.getByText(/No person found with ID/)).toBeInTheDocument();
  });

  it('renders the page title', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByText('Edit person details')).toBeInTheDocument();
  });

  it('renders form with pre-populated data when person loads', async () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    });

    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('person-id-readonly')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('first-name-input')).toHaveValue('John');
    });
    expect(screen.getByTestId('last-name-input')).toHaveValue('Smith');
  });

  it('person ID field is disabled', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByTestId('person-id-readonly')).toBeDisabled();
    expect(screen.getByTestId('person-id-readonly')).toHaveValue('1');
  });

  it('shows training status text for a trained person', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByText('Training status: Trained')).toBeInTheDocument();
  });

  it('shows training status text for a not trained person', () => {
    const untrainedPerson = { ...mockPerson, has_training: false };
    mockedUsePerson.mockReturnValue({ data: untrainedPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    expect(screen.getByText('Training status: Not trained')).toBeInTheDocument();
  });

  it('cancel button navigates to the sites page with the selected site', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);

    renderPage();

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites?selected=UK001');
  });
});
