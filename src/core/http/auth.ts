export const HTTP_CREDENTIALS = {
  default: "same-origin" as RequestCredentials,
  session: "include" as RequestCredentials,
  anonymous: "omit" as RequestCredentials,
} as const;

export const HTTP_AUTH_HEADERS = {
  apiKey: "X-API-Key",
  authorization: "Authorization",
} as const;

export const withApiKeyHeader = (
  headers: HeadersInit | undefined,
  apiKey?: string,
  headerName: string = HTTP_AUTH_HEADERS.apiKey,
): Headers => {
  const merged = new Headers(headers);
  if (apiKey && apiKey.trim().length > 0) {
    merged.set(headerName, apiKey.trim());
  }
  return merged;
};
