/** Public invoice links must work without cookies, staff sessions or browser storage. */
export function publicSafeHeaders(pathname: string, readToken: () => string | null): Record<string, string> {
  if (pathname.startsWith("/invoice/")) return {};
  try {
    const token = readToken();
    return token ? { "x-admin-token": token } : {};
  } catch {
    // Some private and embedded mobile browsers block storage access entirely.
    return {};
  }
}
