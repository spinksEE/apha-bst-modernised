/**
 * Generates a unique error reference in the format ERR-YYYYMMDD-XXXXXX
 * where XXXXXX is 6 random uppercase hex characters.
 */
export function generateErrorReference(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePart = `${year}${month}${day}`;

  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  const hexPart = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
    .join('');

  return `ERR-${datePart}-${hexPart}`;
}
