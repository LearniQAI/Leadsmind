/**
 * Returns `next` only when it is a same-origin internal path, otherwise `fallback`.
 *
 * Used for every post-signup / post-callback redirect target taken from a query string, so a
 * crafted link can't bounce a user to an external site. Isomorphic: safe in client components
 * and route handlers alike.
 *
 * Rejected: non-strings, empty/oversized values, anything not starting with exactly one "/",
 * protocol-relative "//host", any backslash ("/\host" is "//host" to browsers), control
 * characters (browsers strip tab/newline, turning "/\t/host" into "//host"), schemes
 * ("javascript:", "https:"), "@host" / ".host" tricks, and the same tricks hidden behind
 * percent-encoding (checked after each decoding pass).
 */
const BASE = 'http://safe-internal.invalid';
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

function isUnsafeShape(value: string): boolean {
  return (
    value.length === 0 ||
    value[0] !== '/' ||
    value.startsWith('//') ||
    value.includes('\\') ||
    CONTROL_CHARS.test(value)
  );
}

export function safeInternalPath(next: unknown, fallback: string): string {
  if (typeof next !== 'string' || next.length > 2048) return fallback;
  if (isUnsafeShape(next)) return fallback;

  // Re-check the shape after each percent-decoding pass so "/%2F%2Fevil.com", "/%5Cevil.com"
  // and double-encoded variants can't smuggle a host past the raw-string checks above.
  let decoded = next;
  for (let i = 0; i < 3; i++) {
    let step: string;
    try {
      step = decodeURIComponent(decoded);
    } catch {
      return fallback;
    }
    if (step === decoded) break;
    if (isUnsafeShape(step)) return fallback;
    decoded = step;
  }

  let url: URL;
  try {
    url = new URL(next, BASE);
  } catch {
    return fallback;
  }
  if (url.origin !== BASE) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
