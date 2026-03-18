/**
 * SSRF protection utilities: protocol allowlist, DNS resolution with private IP
 * blocking, and DNS-pinned fetch to prevent rebinding attacks.
 *
 * Extracted from plugin-host-services.ts so the same protection can be reused
 * across company-portability imports, HTTP adapters, and any other server-side
 * fetch that accepts user-controlled URLs.
 */

import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

const DNS_LOOKUP_TIMEOUT_MS = 5_000;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/**
 * Returns true when `ip` belongs to a private / reserved range that
 * server-side requests should never be allowed to reach.
 */
export function isPrivateIP(ip: string): boolean {
  const lower = ip.toLowerCase();

  // Unwrap IPv4-mapped IPv6 addresses (::ffff:x.x.x.x)
  const v4MappedMatch = lower.match(/^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4MappedMatch && v4MappedMatch[1]) return isPrivateIP(v4MappedMatch[1]);

  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1]!, 10);
    if (second >= 16 && second <= 31) return true;
  }
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip === "0.0.0.0") return true;

  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
  if (lower.startsWith("fe80")) return true;
  if (lower === "::") return true;

  return false;
}

export interface ValidatedFetchTarget {
  parsedUrl: URL;
  resolvedAddress: string;
  hostHeader: string;
  tlsServername?: string;
  useTls: boolean;
}

/**
 * Validate and DNS-resolve a URL, rejecting private IPs and non-http(s)
 * protocols.  Returns a pinned target so callers can connect directly to
 * the resolved IP, eliminating the DNS-rebinding TOCTOU window.
 */
export async function validateAndResolveFetchUrl(urlString: string): Promise<ValidatedFetchTarget> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    throw new Error(`Invalid URL: ${urlString}`);
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error(
      `Disallowed protocol "${parsed.protocol}" — only http: and https: are permitted`,
    );
  }

  const originalHostname = parsed.hostname.replace(/^\[|\]$/g, "");
  const hostHeader = parsed.host;

  const dnsPromise = dnsLookup(originalHostname, { all: true });
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () => reject(new Error(`DNS lookup timed out after ${DNS_LOOKUP_TIMEOUT_MS}ms for ${originalHostname}`)),
      DNS_LOOKUP_TIMEOUT_MS,
    );
  });

  try {
    const results = await Promise.race([dnsPromise, timeoutPromise]);
    if (results.length === 0) {
      throw new Error(`DNS resolution returned no results for ${originalHostname}`);
    }

    const safeResults = results.filter((entry) => !isPrivateIP(entry.address));
    if (safeResults.length === 0) {
      throw new Error(
        `All resolved IPs for ${originalHostname} are in private/reserved ranges`,
      );
    }

    const resolved = safeResults[0]!;
    return {
      parsedUrl: parsed,
      resolvedAddress: resolved.address,
      hostHeader,
      tlsServername: parsed.protocol === "https:" && isIP(originalHostname) === 0
        ? originalHostname
        : undefined,
      useTls: parsed.protocol === "https:",
    };
  } catch (err) {
    if (err instanceof Error && (
      err.message.startsWith("All resolved IPs") ||
      err.message.startsWith("DNS resolution returned") ||
      err.message.startsWith("DNS lookup timed out")
    )) throw err;
    throw new Error(`DNS resolution failed for ${originalHostname}: ${(err as Error).message}`);
  }
}

/**
 * A simpler convenience wrapper: validate the URL for SSRF and then fetch it
 * using the standard `fetch()` API.  Unlike the pinned HTTP-level request in
 * plugin-host-services this does **not** pin the resolved IP into the socket
 * layer, but it still validates before the request fires which blocks the
 * vast majority of SSRF vectors (private IPs, non-http protocols, etc.).
 *
 * For use-cases that need full DNS-pinning (plugin sandbox) use the lower-level
 * `validateAndResolveFetchUrl` + manual `http.request`.
 */
export async function ssrfSafeFetch(url: string, init?: RequestInit): Promise<Response> {
  await validateAndResolveFetchUrl(url);
  return fetch(url, init);
}
