import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegisterSitePage } from './RegisterSitePage';
import type { Site } from '@apha-bst/shared';

vi.mock('../api/sites');

import { createSite } from '../api/sites';

const mockedCreateSite = vi.mocked(createSite);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/sites/register']}>
          <RegisterSitePage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  );
}

function fillRequiredFields(plantNo = 'UK12345', name = 'Test Abattoir Ltd') {
  fireEvent.change(screen.getByTestId('plant-no-input'), {
    target: { value: plantNo },
  });
  fireEvent.change(screen.getByTestId('site-name-input'), {
    target: { value: name },
  });
}

/** Validation errors appear in both the error summary and inline on the field. */
function expectErrorMessage(text: string) {
  expect(screen.getAllByText(text).length).toBeGreaterThanOrEqual(1);
}

describe('RegisterSitePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the page title and form fields', () => {
    renderPage();

    expect(screen.getByText('Register a new site')).toBeInTheDocument();
    expect(screen.getByText('Plant Number')).toBeInTheDocument();
    expect(screen.getByText('Site Name')).toBeInTheDocument();
    expect(screen.getByText('Address line 1')).toBeInTheDocument();
    expect(screen.getByText('This is an APHA site')).toBeInTheDocument();
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('validates required plant number on submit', async () => {
    renderPage();

    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('Enter a plant number');
    });
    expect(mockedCreateSite).not.toHaveBeenCalled();
  });

  it('validates required site name on submit', async () => {
    renderPage();

    fireEvent.change(screen.getByTestId('plant-no-input'), {
      target: { value: 'UK123' },
    });
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('Enter a site name');
    });
    expect(mockedCreateSite).not.toHaveBeenCalled();
  });

  it('validates plant number is alphanumeric', async () => {
    renderPage();

    fireEvent.change(screen.getByTestId('plant-no-input'), {
      target: { value: 'UK-123!' },
    });
    fireEvent.change(screen.getByTestId('site-name-input'), {
      target: { value: 'Test Site' },
    });
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('Plant number must only contain letters and numbers');
    });
    expect(mockedCreateSite).not.toHaveBeenCalled();
  });

  it('successfully creates a site and navigates to site trainees view', async () => {
    const createdSite: Site = {
      plant_no: 'UK12345',
      name: 'Test Abattoir Ltd',
      address_line_1: null,
      address_line_2: null,
      address_town: null,
      address_county: null,
      address_post_code: null,
      telephone: null,
      fax: null,
      is_apha_site: false,
    };
    mockedCreateSite.mockResolvedValue(createdSite);

    renderPage();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockedCreateSite).toHaveBeenCalled();
    });

    expect(mockedCreateSite.mock.calls[0][0]).toEqual(
      expect.objectContaining({ plant_no: 'UK12345', name: 'Test Abattoir Ltd' }),
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/sites?selected=UK12345');
    });
  });

  it('displays server error for duplicate plant number (BR-006)', async () => {
    mockedCreateSite.mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'A site with this Plant Number already exists.', statusCode: 409 },
      },
      isAxiosError: true,
    });

    renderPage();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('A site with this Plant Number already exists.');
    });
  });

  it('displays server error for duplicate site name (BR-015)', async () => {
    mockedCreateSite.mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'A site with this Name already exists.', statusCode: 409 },
      },
      isAxiosError: true,
    });

    renderPage();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('A site with this Name already exists.');
    });
  });

  it('displays generic error when server returns no data', async () => {
    mockedCreateSite.mockRejectedValue({
      response: undefined,
      isAxiosError: true,
    });

    renderPage();
    fillRequiredFields();
    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expectErrorMessage('An unexpected error occurred. Please try again.');
    });
  });

  it('cancel button navigates to /sites', () => {
    renderPage();

    fireEvent.click(screen.getByTestId('cancel-button'));

    expect(mockNavigate).toHaveBeenCalledWith('/sites');
  });

  it('sends optional fields only when populated', async () => {
    const createdSite: Site = {
      plant_no: 'UK12345',
      name: 'Test Site',
      address_line_1: '123 Road',
      address_line_2: null,
      address_town: 'Oxton',
      address_county: null,
      address_post_code: null,
      telephone: '01234',
      fax: null,
      is_apha_site: true,
    };
    mockedCreateSite.mockResolvedValue(createdSite);

    renderPage();
    fillRequiredFields('UK12345', 'Test Site');

    fireEvent.change(screen.getByLabelText('Address line 1'), { target: { value: '123 Road' } });
    fireEvent.change(screen.getByLabelText('Town'), { target: { value: 'Oxton' } });
    fireEvent.change(screen.getByLabelText('Telephone'), { target: { value: '01234' } });
    fireEvent.click(screen.getByLabelText('This is an APHA site'));

    fireEvent.submit(screen.getByTestId('save-button'));

    await waitFor(() => {
      expect(mockedCreateSite).toHaveBeenCalled();
    });

    const callArgs = mockedCreateSite.mock.calls[0][0];
    expect(callArgs).toEqual(
      expect.objectContaining({
        plant_no: 'UK12345',
        name: 'Test Site',
        address_line_1: '123 Road',
        address_town: 'Oxton',
        telephone: '01234',
        is_apha_site: true,
      }),
    );
    expect(callArgs).not.toHaveProperty('address_line_2');
    expect(callArgs).not.toHaveProperty('address_county');
  });
});
