import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditSiteNamePage } from './EditSiteNamePage';
import type { Site } from '@apha-bst/shared';

vi.mock('../api/sites');

import { getSiteByPlantNo, updateSiteName } from '../api/sites';

const mockedGetSite = vi.mocked(getSiteByPlantNo);
const mockedUpdateSiteName = vi.mocked(updateSiteName);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const baseSite: Site = {
  plant_no: 'UK12345',
  name: 'Old Abattoir Co',
  address_line_1: null,
  address_line_2: null,
  address_town: null,
  address_county: null,
  address_post_code: null,
  telephone: null,
  fax: null,
  is_apha_site: false,
};

function renderPage(plantNo = 'UK12345') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={[`/sites/${plantNo}/edit`]}>
          <Routes>
            <Route path="/sites/:plantNo/edit" element={<EditSiteNamePage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('EditSiteNamePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('shows loading state while fetching site', () => {
    mockedGetSite.mockReturnValue(new Promise(() => {})); // never resolves
    renderPage();

    expect(screen.getByTestId('edit-loading')).toBeInTheDocument();
  });

  it('shows not-found alert when site does not exist', async () => {
    mockedGetSite.mockRejectedValue({ response: { status: 404 } });

    renderPage('MISSING');

    await waitFor(() => {
      expect(screen.getByTestId('site-not-found')).toBeInTheDocument();
    });
    expect(screen.getByText(/No site found with plant number/)).toBeInTheDocument();
  });

  it('renders site details as read-only fields once loaded', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('plant-no-readonly')).toBeInTheDocument();
    });

    const plantNoInput = screen.getByTestId('plant-no-readonly');
    expect(plantNoInput).toHaveValue('UK12345');
    expect(plantNoInput).toBeDisabled();

    const currentNameInput = screen.getByTestId('current-name-readonly');
    expect(currentNameInput).toHaveValue('Old Abattoir Co');
    expect(currentNameInput).toBeDisabled();
  });

  it('renders the page title and new name field', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    renderPage();

    await waitFor(() => {
      expect(screen.getByText('Edit site name')).toBeInTheDocument();
    });

    expect(screen.getByTestId('new-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('validates that new name is required', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('new-name-input')).toBeInTheDocument();
    });

    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('Enter a new site name')).toBeInTheDocument();
    });
    expect(mockedUpdateSiteName).not.toHaveBeenCalled();
  });

  it('successfully updates site name and navigates back (US-003 / BR-007)', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    const updatedSite: Site = {
      ...baseSite,
      name: 'New Meadow Farms [Old Abattoir Co]',
    };
    mockedUpdateSiteName.mockResolvedValue(updatedSite);

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('new-name-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'New Meadow Farms' },
    });
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockedUpdateSiteName).toHaveBeenCalledWith('UK12345', 'New Meadow Farms');
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sites?selected=UK12345');
    });
  });

  it('displays server error for duplicate name (BR-015)', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    mockedUpdateSiteName.mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'A site with this Name already exists.', statusCode: 409 },
      },
      isAxiosError: true,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('new-name-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'Duplicate Name' },
    });
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getAllByText('A site with this Name already exists.').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('displays generic error when server returns no data', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    mockedUpdateSiteName.mockRejectedValue({
      response: undefined,
      isAxiosError: true,
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('new-name-input')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByTestId('new-name-input'), {
      target: { value: 'Some Name' },
    });
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  it('cancel button navigates back to sites view', async () => {
    mockedGetSite.mockResolvedValue(baseSite);
    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites?selected=UK12345');
  });
});
