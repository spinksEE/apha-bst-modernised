import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SiteTraineesPage } from './SiteTraineesPage';
import type { Site, SiteListItem } from '@apha-bst/shared';

vi.mock('../api/sites');

import { searchSites, getSiteByPlantNo, deleteSite } from '../api/sites';

const mockedSearchSites = vi.mocked(searchSites);
const mockedGetSite = vi.mocked(getSiteByPlantNo);
const mockedDeleteSite = vi.mocked(deleteSite);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const siteList: SiteListItem[] = [
  { plant_no: 'UK001', name: 'Abattoir Alpha' },
  { plant_no: 'UK002', name: 'Abattoir Beta' },
];

const siteDetail: Site = {
  plant_no: 'UK001',
  name: 'Abattoir Alpha',
  address_line_1: '123 Farm Road',
  address_line_2: null,
  address_town: 'Oxton',
  address_county: 'Oxfordshire',
  address_post_code: 'OX1 2AB',
  telephone: '01onal',
  fax: null,
  is_apha_site: true,
};

function renderPage(initialEntries = ['/sites']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <SiteTraineesPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

describe('SiteTraineesPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the page title and search input', () => {
    renderPage();

    expect(screen.getByText('Site trainees')).toBeInTheDocument();
    expect(screen.getByTestId('site-search-input')).toBeInTheDocument();
  });

  it('does not show site details when no site is selected', () => {
    renderPage();

    expect(screen.queryByTestId('site-details-card')).not.toBeInTheDocument();
    expect(screen.queryByTestId('personnel-table')).not.toBeInTheDocument();
  });

  it('displays site details when a site is pre-selected via URL param', async () => {
    mockedSearchSites.mockResolvedValue(siteList);
    mockedGetSite.mockResolvedValue(siteDetail);

    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('site-details-card')).toBeInTheDocument();
    });

    expect(screen.getByText('Abattoir Alpha')).toBeInTheDocument();
    expect(screen.getByText('Plant Number: UK001')).toBeInTheDocument();
    expect(screen.getByText('123 Farm Road')).toBeInTheDocument();
    expect(screen.getByText('Oxton, Oxfordshire')).toBeInTheDocument();
    expect(screen.getByText('OX1 2AB')).toBeInTheDocument();
    expect(screen.getByText('Tel: 01onal')).toBeInTheDocument();
    expect(screen.getByText('Total Personnel: 0')).toBeInTheDocument();
  });

  it('shows the empty personnel message (FT-002 stub)', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);

    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('no-trainees-message')).toBeInTheDocument();
    });

    expect(screen.getByText('No trainees associated with this site.')).toBeInTheDocument();
  });

  it('shows edit and delete buttons for a selected site', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('edit-site-button')).toBeInTheDocument();
    });
    expect(screen.getByTestId('delete-site-button')).toBeInTheDocument();
  });

  it('edit button navigates to the edit page', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('edit-site-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('edit-site-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites/UK001/edit');
  });

  it('opens delete confirmation modal when delete is clicked', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('delete-site-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-site-button'));

    await waitFor(() => {
      expect(screen.getByText('Confirm deletion')).toBeInTheDocument();
    });
    expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
  });

  it('successfully deletes a site and resets selection (US-004 empty site)', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    mockedDeleteSite.mockResolvedValue(undefined);

    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('delete-site-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-site-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(mockedDeleteSite).toHaveBeenCalled();
    });
    expect(mockedDeleteSite.mock.calls[0][0]).toBe('UK001');

    // After successful deletion, the site details card should no longer be visible
    await waitFor(() => {
      expect(screen.queryByTestId('site-details-card')).not.toBeInTheDocument();
    });
  });

  it('displays error when deleting a site with personnel (BR-008)', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    mockedDeleteSite.mockRejectedValue({
      response: {
        status: 409,
        data: {
          message: 'There are personnel from Abattoir Alpha. You can only delete a site with no trainees.',
        },
      },
    });

    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('delete-site-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-site-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/There are personnel from Abattoir Alpha/),
    ).toBeInTheDocument();
  });

  it('shows generic error on unexpected delete failure', async () => {
    mockedGetSite.mockResolvedValue(siteDetail);
    mockedDeleteSite.mockRejectedValue({
      response: { status: 500 },
    });

    renderPage(['/sites?selected=UK001']);

    await waitFor(() => {
      expect(screen.getByTestId('delete-site-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('delete-site-button'));

    await waitFor(() => {
      expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(screen.getByTestId('delete-error')).toBeInTheDocument();
    });

    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });
});
