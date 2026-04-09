import { describe, it, expect } from 'vitest';
import { generateErrorReference } from './errorReference';

describe('generateErrorReference', () => {
  it('returns a string matching the ERR-YYYYMMDD-XXXXXX format', () => {
    const ref = generateErrorReference();
    expect(ref).toMatch(/^ERR-\d{8}-[A-F0-9]{6}$/);
  });

  it('includes the current date in the reference', () => {
    const ref = generateErrorReference();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const expectedDate = `${year}${month}${day}`;

    expect(ref).toContain(expectedDate);
  });

  it('produces unique values on consecutive calls', () => {
    const refs = new Set(Array.from({ length: 20 }, () => generateErrorReference()));
    expect(refs.size).toBe(20);
  });
});
