/**
 * Logs a structured error entry to console.error for server-side debugging.
 * Error details are never rendered in the UI (BR-072).
 */
export function logError(errorRef: string, error: unknown): void {
  const message =
    error instanceof Error ? error.message : String(error);
  const stack =
    error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      errorRef,
      timestamp: new Date().toISOString(),
      message,
      stack,
    }),
  );
}
