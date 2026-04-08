import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddPersonPage } from './AddPersonPage';
import type { SiteListItem } from '@apha-bst/shared';

vi.mock('../api/sites');
vi.mock('../api/persons');

import { checkDuplicate } from '../api/persons';

const mockedCheckDuplicate = vi.mocked(checkDuplicate);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockMutate = vi.fn();
vi.mock('../hooks/usePersons', () => ({
  useCreatePerson: () => ({
    mutate: mockMutate,
    isPending: false,
  }),
}));

const sites: SiteListItem[] = [
  { plant_no: 'UK001', name: 'Abattoir Alpha' },
  { plant_no: 'UK002', name: 'Abattoir Beta' },
];

vi.mock('../hooks/useSites', () => ({
  useAllSites: () => ({ data: sites, isLoading: false }),
  useSearchSites: () => ({ data: [], isLoading: false }),
}));

function renderPage(initialEntries = ['/persons/add']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <AddPersonPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('AddPersonPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockMutate.mockReset();
  });

  it('renders page title and form fields', () => {
    renderPage();

    expect(screen.getByText('Add a new person')).toBeInTheDocument();
    expect(screen.getByTestId('site-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('person-id-display')).toBeInTheDocument();
    expect(screen.getByTestId('first-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('last-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
  });

  it('shows "Auto-generated on save" for person ID field', () => {
    renderPage();

    const personIdInput = screen.getByTestId('person-id-display');
    expect(personIdInput).toBeInTheDocument();
    expect(personIdInput).toHaveValue('Auto-generated on save');
    expect(personIdInput).toBeDisabled();
  });

  it('shows validation errors when submitting with empty fields', async () => {
    renderPage();

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('Enter a first name')).toBeInTheDocument();
    });

    expect(screen.getByText('Enter a last name')).toBeInTheDocument();
    expect(screen.getByText('Select a site')).toBeInTheDocument();
  });

  it('cancel navigates to /sites when no preselected site', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites');
  });

  it('cancel navigates to /sites?selected=<site_id> when site_id is in query params', () => {
    renderPage(['/persons/add?site_id=UK001']);

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites?selected=UK001');
  });

  it('shows duplicate modal when checkDuplicate returns isDuplicate true', async () => {
    mockedCheckDuplicate.mockResolvedValue({ isDuplicate: true, existing: [] });

    // Pre-select site via URL param so the site_id form field is pre-populated
    renderPage(['/persons/add?site_id=UK001']);

    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Smith' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockedCheckDuplicate).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-modal')).toBeInTheDocument();
    });

    expect(screen.getByText(/A person with this name already exists/)).toBeInTheDocument();
    expect(screen.getByTestId('duplicate-proceed-button')).toBeInTheDocument();
    expect(screen.getByTestId('duplicate-cancel-button')).toBeInTheDocument();
  });

  it('closes duplicate modal when cancel is clicked', async () => {
    mockedCheckDuplicate.mockResolvedValue({ isDuplicate: true, existing: [] });

    // Pre-select site via URL param so the site_id form field is pre-populated
    renderPage(['/persons/add?site_id=UK001']);

    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Smith' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-modal')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('duplicate-cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('duplicate-cancel-button'));

    await waitFor(() => {
      expect(screen.queryByTestId('duplicate-cancel-button')).not.toBeInTheDocument();
    });
  });

  it('proceeds with creation when checkDuplicate returns no duplicate', async () => {
    mockedCheckDuplicate.mockResolvedValue({ isDuplicate: false, existing: [] });

    // Pre-select site via URL param so the site_id form field is pre-populated
    renderPage(['/persons/add?site_id=UK002']);

    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Doe' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalled();
    });

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ first_name: 'Jane', last_name: 'Doe', site_id: 'UK002' }),
      expect.any(Object),
    );
  });

  it('navigates to /sites?selected=<site_id> on successful save', async () => {
    mockedCheckDuplicate.mockResolvedValue({ isDuplicate: false, existing: [] });
    mockMutate.mockImplementation((_data, { onSuccess }) => {
      onSuccess({ person_id: 42, display_name: 'Doe, Jane', first_name: 'Jane', last_name: 'Doe', site_id: 'UK002', has_training: false });
    });

    // Pre-select site via URL param so the site_id form field is pre-populated
    renderPage(['/persons/add?site_id=UK002']);

    fireEvent.change(screen.getByTestId('first-name-input'), {
      target: { value: 'Jane' },
    });
    fireEvent.change(screen.getByTestId('last-name-input'), {
      target: { value: 'Doe' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        '/sites?selected=UK002',
        expect.objectContaining({ state: expect.objectContaining({ notification: expect.stringContaining('Doe, Jane') }) }),
      );
    });
  });
});
