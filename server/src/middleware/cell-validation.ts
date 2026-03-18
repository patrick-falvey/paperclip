/**
 * Cell subdomain validation — a pure function that verifies a request's
 * Host header subdomain matches the expected cellId.
 *
 * Defense-in-depth: the ALB routes subdomains to the correct cell, but we
 * validate server-side too.
 */

export interface CellValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate that the request's subdomain matches the expected cell ID.
 *
 * @param host - The Host header value (may include port)
 * @param cellId - The expected cell ID, or undefined if not in cell mode
 */
export function validateCellRequest(
  host: string,
  cellId: string | undefined,
): CellValidationResult {
  // If not in cell mode, always valid
  if (cellId === undefined) {
    return { valid: true };
  }

  // Strip port from host
  const hostname = host.replace(/:\d+$/, "");

  // Split into parts
  const parts = hostname.split(".");

  // If fewer than 3 parts (e.g., "localhost", "paperclip.app"), not a
  // subdomain request — allow through
  if (parts.length < 3) {
    return { valid: true };
  }

  // First segment is the subdomain
  const subdomain = parts[0];

  if (subdomain === cellId) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Subdomain mismatch: expected "${cellId}", got "${subdomain}"`,
  };
}
