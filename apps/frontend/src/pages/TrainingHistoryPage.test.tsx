import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TrainingHistoryPage } from './TrainingHistoryPage';

vi.mock('../api/persons');
vi.mock('../api/training');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: '10' }) };
});

const mockDeleteMutate = vi.fn();
vi.mock('../hooks/useTraining', () => ({
  useTrainingsByTrainee: vi.fn(),
  useDeleteTraining: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

vi.mock('../hooks/usePersons', () => ({
  usePerson: vi.fn(),
}));

import { useTrainingsByTrainee } from '../hooks/useTraining';
import { usePerson } from '../hooks/usePersons';

const mockedUseTrainingsByTrainee = vi.mocked(useTrainingsByTrainee);
const mockedUsePerson = vi.mocked(usePerson);

const mockPerson = {
  person_id: 10,
  first_name: 'James',
  last_name: 'Wilson',
  display_name: 'Wilson, James',
  site_id: 'UK001',
  has_training: true,
};

const mockTrainings = [
  {
    training_id: 1,
    date_trained: '2026-03-15',
    training_type: 'Trained' as const,
    species_trained: ['Cattle' as const, 'Sheep' as const],
    trainer_display_name: 'Reed, Catherine',
  },
  {
    training_id: 2,
    date_trained: '2026-02-10',
    training_type: 'CascadeTrained' as const,
    species_trained: ['Goat' as const],
    trainer_display_name: 'Reed, Catherine',
  },
];

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/persons/10/training']}>
          <TrainingHistoryPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('TrainingHistoryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while person data loads', () => {
    mockedUsePerson.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    expect(screen.getByTestId('page-loading')).toBeInTheDocument();
  });

  it('shows person not found alert when person is null', () => {
    mockedUsePerson.mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: undefined, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    expect(screen.getByTestId('person-not-found')).toBeInTheDocument();
  });

  it('renders training history page with person details', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    expect(screen.getByText('Training history')).toBeInTheDocument();
    expect(screen.getByTestId('person-name')).toHaveTextContent('Wilson, James');
    expect(screen.getByTestId('person-details')).toHaveTextContent('Person ID: 10');
  });

  it('renders training records in the table', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    expect(screen.getByTestId('training-table')).toBeInTheDocument();
    expect(screen.getByTestId('training-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('training-row-2')).toBeInTheDocument();
    expect(screen.getByText('2026-03-15')).toBeInTheDocument();
    expect(screen.getByText('Trained')).toBeInTheDocument();
    expect(screen.getByText('Cattle, Sheep')).toBeInTheDocument();
    expect(screen.getByText('Cascade Trained')).toBeInTheDocument();
  });

  it('shows empty state when no training records exist', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    expect(screen.getByTestId('no-trainings-message')).toBeInTheDocument();
    expect(screen.getByText('No training records found for this person.')).toBeInTheDocument();
  });

  it('has add training button linking to record training page', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    const addButton = screen.getByTestId('add-training-button');
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('href', '/training/add?trainee_id=10');
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    fireEvent.click(screen.getByTestId('delete-training-1'));

    await waitFor(() => {
      expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
    });
    expect(screen.getByTestId('confirm-delete-training-button')).toBeInTheDocument();
  });

  it('calls deleteTraining mutation when confirm delete is clicked', async () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    fireEvent.click(screen.getByTestId('delete-training-1'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-training-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-delete-training-button'));

    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('navigates to edit page when edit button is clicked', () => {
    mockedUsePerson.mockReturnValue({ data: mockPerson, isLoading: false } as ReturnType<typeof usePerson>);
    mockedUseTrainingsByTrainee.mockReturnValue({ data: mockTrainings, isLoading: false } as ReturnType<typeof useTrainingsByTrainee>);

    renderPage();

    fireEvent.click(screen.getByTestId('edit-training-1'));

    expect(mockNavigate).toHaveBeenCalledWith('/training/1/edit');
  });
});
