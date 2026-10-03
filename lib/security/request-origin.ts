function parseOrigin(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function getTrustedRequestOrigin(request: Request) {
  const requestUrl = new URL(request.url);
  const requestOrigin = requestUrl.origin;
  const configuredOrigin = parseOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const allowedOrigins = new Set([
    configuredOrigin,
    ...[
      process.env.VERCEL_URL,
      process.env.VERCEL_BRANCH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
    ].map((host) => parseOrigin(host ? `https://${host}` : undefined)),
  ]);
  const isAllowed = (origin: string) => {
    const url = new URL(origin);
    return (
      allowedOrigins.has(origin) ||
      (process.env.VERCEL !== "1" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    );
  };
  if (!isAllowed(requestOrigin)) return null;
  // Next's dev server can normalize 127.0.0.1 to localhost. Accept Host only after
  // checking it against the same exact server configuration; never trust forwarded-host.
  const host = request.headers.get("host");
  const transportOrigin = parseOrigin(
    host ? `${requestUrl.protocol}//${host}` : undefined,
  );
  return transportOrigin && isAllowed(transportOrigin)
    ? transportOrigin
    : requestOrigin;
}

export function isSameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  const trustedOrigin = getTrustedRequestOrigin(request);
  return Boolean(
    trustedOrigin &&
    origin === trustedOrigin &&
    request.headers.get("sec-fetch-site") !== "cross-site",
  );
}
