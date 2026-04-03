import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ReadOnlyAction, ReadOnlyFieldset, ReadOnlyNotice } from './readOnly';

describe('readOnly helpers', () => {
  it('renders notice only when read-only', () => {
    const { rerender } = render(<ReadOnlyNotice isReadOnly={false} />);

    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    rerender(<ReadOnlyNotice isReadOnly />);

    expect(screen.getByRole('note')).toHaveTextContent('read-only');
  });

  it('disables fieldset content when read-only', () => {
    render(
      <ReadOnlyFieldset isReadOnly>
        <label>
          Field
          <input type="text" defaultValue="value" />
        </label>
      </ReadOnlyFieldset>,
    );

    expect(screen.getByLabelText(/field/i)).toBeDisabled();
  });

  it('hides or disables actions based on mode', () => {
    const { rerender } = render(
      <ReadOnlyAction isReadOnly mode="hide">
        <button type="button">Save</button>
      </ReadOnlyAction>,
    );

    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();

    rerender(
      <ReadOnlyAction isReadOnly mode="disable">
        <button type="button">Save</button>
      </ReadOnlyAction>,
    );

    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });
});
