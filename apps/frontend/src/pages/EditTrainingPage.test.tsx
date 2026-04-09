import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditTrainingPage } from './EditTrainingPage';

vi.mock('../api/persons');
vi.mock('../api/training');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate, useParams: () => ({ id: '1' }) };
});

const mockUpdateMutate = vi.fn();
vi.mock('../hooks/useTraining', () => ({
  useTraining: vi.fn(),
  useUpdateTraining: () => ({
    mutate: mockUpdateMutate,
    isPending: false,
  }),
}));

const mockTrainers = [
  { trainer_id: 1, first_name: 'Catherine', last_name: 'Reed', display_name: 'Reed, Catherine', location_id: 'UK001', person_id: null },
  { trainer_id: 2, first_name: 'James', last_name: 'Wilson', display_name: 'Wilson, James', location_id: 'UK002', person_id: 10 },
];

vi.mock('../hooks/useTrainers', () => ({
  useTrainers: () => ({ data: mockTrainers, isLoading: false }),
}));

import { useTraining } from '../hooks/useTraining';

const mockedUseTraining = vi.mocked(useTraining);

const mockTraining = {
  training_id: 1,
  trainee_id: 10,
  trainer_id: 1,
  date_trained: '2026-03-15',
  species_trained: ['Cattle' as const, 'Sheep' as const],
  training_type: 'Trained' as const,
  trainer_display_name: 'Reed, Catherine',
  trainee_display_name: 'Wilson, James',
};

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/training/1/edit']}>
          <EditTrainingPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('EditTrainingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state while training data loads', () => {
    mockedUseTraining.mockReturnValue({ data: undefined, isLoading: true } as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByTestId('edit-loading')).toBeInTheDocument();
  });

  it('shows training not found alert when training is null', () => {
    mockedUseTraining.mockReturnValue({ data: null, isLoading: false } as unknown as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByTestId('training-not-found')).toBeInTheDocument();
  });

  it('renders the edit page title', () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByText('Edit training record')).toBeInTheDocument();
  });

  it('renders form with pre-populated data when training loads', async () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('trainee-search-input')).toHaveValue('Wilson, James');
    });

    expect(screen.getByTestId('trainer-search-input')).toHaveValue('Reed, Catherine');
    expect(screen.getByTestId('date-trained-input')).toHaveValue('2026-03-15');
  });

  it('renders all training type radio options', () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByTestId('training-type-Trained')).toBeInTheDocument();
    expect(screen.getByTestId('training-type-CascadeTrained')).toBeInTheDocument();
    expect(screen.getByTestId('training-type-TrainingConfirmed')).toBeInTheDocument();
  });

  it('renders all species checkboxes', () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByTestId('species-Cattle')).toBeInTheDocument();
    expect(screen.getByTestId('species-Sheep')).toBeInTheDocument();
    expect(screen.getByTestId('species-Goat')).toBeInTheDocument();
  });

  it('cancel button navigates to training history', () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/persons/10/training');
  });

  it('shows save button', () => {
    mockedUseTraining.mockReturnValue({ data: mockTraining, isLoading: false } as ReturnType<typeof useTraining>);

    renderPage();

    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
});
