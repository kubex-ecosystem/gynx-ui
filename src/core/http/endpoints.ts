export const API_V1_PREFIX = "/api/v1";

const trimTrailingSlashes = (value: string): string =>
  value.replace(/\/+$/, "");

const normalizePath = (path: string): string => {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
};

const normalizeProxyPath = (path: string): string => {
  const normalized = normalizePath(path);
  return normalized === "/" ? "" : normalized;
};

export const isApiV1Path = (path: string): boolean =>
  path === API_V1_PREFIX || path.startsWith(`${API_V1_PREFIX}/`);

export const buildApiV1Path = (endpoint: string): string =>
  `${API_V1_PREFIX}${normalizePath(endpoint)}`;

export const buildApiV1Url = (baseURL: string, endpoint: string): string => {
  const normalizedBaseURL = trimTrailingSlashes(baseURL);
  if (normalizedBaseURL.endsWith(API_V1_PREFIX)) {
    return `${normalizedBaseURL}${normalizePath(endpoint)}`;
  }
  return `${normalizedBaseURL}${buildApiV1Path(endpoint)}`;
};

export const httpEndpoints = {
  auth: {
    me: "/me",
    signIn: "/auth/sign-in",
    signOut: "/sign-out",
    oauthGoogleStart: "/auth/google/start",
  },
  config: {
    root: "/config",
  },
  invites: {
    root: "/invites",
    create: "/invites",
    validate: "/invites/validate",
    accept: "/invites/accept",
  },
  access: {
    members: "/access/members",
    memberRole: (userId: string) => `/access/members/${userId}/role`,
  },
  unified: {
    root: "/unified",
    stream: "/unified/stream",
    providerTest: "/test",
  },
  agents: {
    root: "/agents",
    generate: "/agents/generate",
    markdown: "/agents.md",
    byId: (id: string | number) => `/agents/${id}`,
  },
  gateway: {
    metrics: "/gateway/metrics",
    logs: "/gateway/logs",
  },
  sync: {
    integrations: "/integrations",
    jobs: "/sync-jobs",
  },
  lookatni: {
    extract: "/lookatni/extract",
    archive: "/lookatni/archive",
  },
  grompt: {
    generate: "/generate",
    generateStream: "/generate/stream",
    providers: "/providers",
    healthz: "/healthz",
    proxy: (path: string) => `/proxy${normalizeProxyPath(path)}`,
  },
  scorecard: {
    root: "/scorecard",
    advice: "/scorecard/advice",
  },
  metrics: {
    ai: "/metrics/ai",
  },
} as const;
