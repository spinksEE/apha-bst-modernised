import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { describe, it, expect, vi } from 'vitest';
import { AccessDeniedPage } from './AccessDeniedPage';
import { theme } from '../theme/theme';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderAccessDeniedPage() {
  return render(
    <MantineProvider theme={theme}>
      <MemoryRouter initialEntries={['/access-denied']}>
        <Routes>
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>,
  );
}

describe('AccessDeniedPage', () => {
  it('renders access denied heading and messages', () => {
    renderAccessDeniedPage();

    expect(screen.getByTestId('access-denied-heading')).toHaveTextContent(
      'Access Denied',
    );
    expect(
      screen.getByText(
        'You do not have permission to access the Brainstem Training System.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This access attempt has been logged/),
    ).toBeInTheDocument();
  });

  it('displays a reference ID in the correct format', () => {
    renderAccessDeniedPage();

    const refElement = screen.getByTestId('reference-id');
    expect(refElement).toBeInTheDocument();

    const refText = refElement.textContent ?? '';
    // Format: UA-YYYYMMDD-HHmm-XXX
    expect(refText).toMatch(/Reference: UA-\d{8}-\d{4}-[A-Z0-9]{3}/);
  });

  it('displays contact information', () => {
    renderAccessDeniedPage();

    const contactElement = screen.getByTestId('contact-info');
    expect(contactElement).toHaveTextContent('bst-support@apha.gov.uk');
    expect(contactElement).toHaveTextContent('01234 567890');
  });

  it('navigates to /login when return button is clicked', async () => {
    const user = userEvent.setup();
    renderAccessDeniedPage();

    const returnButton = screen.getByTestId('return-button');
    expect(returnButton).toHaveTextContent('Return to Login');

    await user.click(returnButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
