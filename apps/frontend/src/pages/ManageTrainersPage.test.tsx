import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageTrainersPage } from './ManageTrainersPage';

vi.mock('../api/sites');
vi.mock('../api/trainers');

const mockCreateMutate = vi.fn();
const mockDeleteMutate = vi.fn();

vi.mock('../hooks/useTrainers', () => ({
  useTrainers: vi.fn(),
  useCreateTrainer: vi.fn(() => ({
    mutate: mockCreateMutate,
    isPending: false,
  })),
  useDeleteTrainer: vi.fn(() => ({
    mutate: mockDeleteMutate,
    isPending: false,
  })),
}));

vi.mock('../hooks/useSites', () => ({
  useAllSites: vi.fn(() => ({ data: [{ plant_no: 'UK001', name: 'Test Site' }], isLoading: false })),
  useSearchSites: vi.fn(() => ({ data: [], isLoading: false })),
}));

import { useTrainers, useCreateTrainer, useDeleteTrainer } from '../hooks/useTrainers';
import { useAllSites, useSearchSites } from '../hooks/useSites';

const mockedUseTrainers = vi.mocked(useTrainers);
const mockedUseCreateTrainer = vi.mocked(useCreateTrainer);
const mockedUseDeleteTrainer = vi.mocked(useDeleteTrainer);
const mockedUseAllSites = vi.mocked(useAllSites);
const mockedUseSearchSites = vi.mocked(useSearchSites);

const trainerList = [
  { trainer_id: 1, first_name: 'Helen', last_name: 'King', display_name: 'King, Helen', location_id: 'UK001', person_id: null },
  { trainer_id: 2, first_name: 'Grace', last_name: 'Moore', display_name: 'Moore, Grace', location_id: 'UK001', person_id: 5 },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/trainers']}>
          <ManageTrainersPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('ManageTrainersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseCreateTrainer.mockReturnValue({ mutate: mockCreateMutate, isPending: false } as unknown as ReturnType<typeof useCreateTrainer>);
    mockedUseDeleteTrainer.mockReturnValue({ mutate: mockDeleteMutate, isPending: false } as unknown as ReturnType<typeof useDeleteTrainer>);
    mockedUseAllSites.mockReturnValue({ data: [{ plant_no: 'UK001', name: 'Test Site' }], isLoading: false } as unknown as ReturnType<typeof useAllSites>);
    mockedUseSearchSites.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useSearchSites>);
  });

  it('renders page title and trainer table', () => {
    mockedUseTrainers.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useTrainers>);

    renderPage();

    expect(screen.getByText('Manage trainers')).toBeInTheDocument();
    expect(screen.getByTestId('trainers-table')).toBeInTheDocument();
  });

  it('shows "No trainers registered." when trainer list is empty', () => {
    mockedUseTrainers.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useTrainers>);

    renderPage();

    expect(screen.getByTestId('no-trainers-message')).toBeInTheDocument();
    expect(screen.getByText('No trainers registered.')).toBeInTheDocument();
  });

  it('renders trainer data with APHA Staff and Cascade types', () => {
    mockedUseTrainers.mockReturnValue({ data: trainerList, isLoading: false } as ReturnType<typeof useTrainers>);

    renderPage();

    expect(screen.getByText('King, Helen')).toBeInTheDocument();
    expect(screen.getByText('Moore, Grace')).toBeInTheDocument();

    // Helen has person_id: null → APHA Staff
    expect(screen.getByText('APHA Staff')).toBeInTheDocument();
    // Grace has person_id: 5 → Cascade
    expect(screen.getByText('Cascade')).toBeInTheDocument();

    // Table column headers are present
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Trainer Name')).toBeInTheDocument();
    // "Location" appears both in the table header and the form label
    expect(screen.getAllByText('Location').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('shows delete buttons for each trainer', () => {
    mockedUseTrainers.mockReturnValue({ data: trainerList, isLoading: false } as ReturnType<typeof useTrainers>);

    renderPage();

    expect(screen.getByTestId('delete-trainer-1')).toBeInTheDocument();
    expect(screen.getByTestId('delete-trainer-2')).toBeInTheDocument();
  });

  it('opens delete confirmation modal when delete is clicked', async () => {
    mockedUseTrainers.mockReturnValue({ data: trainerList, isLoading: false } as ReturnType<typeof useTrainers>);

    renderPage();

    fireEvent.click(screen.getByTestId('delete-trainer-1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-trainer-button')).toBeInTheDocument();
    });

    expect(screen.getByText(/Are you sure you want to delete trainer/)).toBeInTheDocument();
    expect(screen.getAllByText(/King, Helen/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('confirm-delete-trainer-button')).toBeInTheDocument();
  });

  it('shows add trainer form with all fields', () => {
    mockedUseTrainers.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useTrainers>);

    renderPage();

    expect(screen.getByText('Add new trainer')).toBeInTheDocument();
    expect(screen.getByTestId('trainer-first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('trainer-last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('trainer-location-input')).toBeInTheDocument();
    expect(screen.getByTestId('trainer-person-id-input')).toBeInTheDocument();
    expect(screen.getByTestId('add-trainer-button')).toBeInTheDocument();
  });
});
