import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logError } from './errorLogger';

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('calls console.error with the error reference', () => {
    logError('ERR-20260408-ABC123', new Error('test'));

    expect(console.error).toHaveBeenCalledOnce();
    const logged = (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(logged).toContain('ERR-20260408-ABC123');
  });

  it('includes timestamp and reference in the logged object', () => {
    logError('ERR-20260408-DEF456', new Error('boom'));

    const logged = JSON.parse(
      (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0],
    );
    expect(logged).toHaveProperty('errorRef', 'ERR-20260408-DEF456');
    expect(logged).toHaveProperty('timestamp');
    expect(logged.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('extracts message and stack from Error instances', () => {
    const err = new Error('something broke');
    logError('ERR-20260408-GHI789', err);

    const logged = JSON.parse(
      (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0],
    );
    expect(logged.message).toBe('something broke');
    expect(logged.stack).toBeDefined();
  });

  it('handles non-Error values gracefully', () => {
    logError('ERR-20260408-JKL012', 'string error');

    const logged = JSON.parse(
      (console.error as ReturnType<typeof vi.fn>).mock.calls[0][0],
    );
    expect(logged.message).toBe('string error');
    expect(logged.stack).toBeUndefined();
  });
});
