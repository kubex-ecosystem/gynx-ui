export const APP_SECTION_IDS = [
  "landing",
  "auth",
  "accept-invite",
  "welcome",
  "gateway-dashboard",
  "data-analyzer",
  "mail-hub",
  "data-sync",
  "workspace-settings",
  "providers-settings",
  "playground",
  "prompt",
  "agents",
  "chat",
  "summarizer",
  "code",
  "images",
] as const;

export type AppSectionId = (typeof APP_SECTION_IDS)[number];

export const PUBLIC_SECTION_IDS: AppSectionId[] = [
  "landing",
  "auth",
  "accept-invite",
];
export const AUTH_REDIRECT_SECTION_IDS: AppSectionId[] = ["landing", "auth"];
export const STANDALONE_SECTION_IDS: AppSectionId[] = [
  "landing",
  "auth",
  "accept-invite",
];

const normalizeSectionId = (raw: string): AppSectionId | null => {
  const candidate = decodeURIComponent(raw).split("?")[0] as AppSectionId;
  return APP_SECTION_IDS.includes(candidate) ? candidate : null;
};

export const getSectionFromHash = (hash: string): AppSectionId | null => {
  if (hash.startsWith("#prompt=")) {
    return "prompt";
  }

  if (hash.startsWith("#section=")) {
    return normalizeSectionId(hash.slice("#section=".length));
  }

  return normalizeSectionId(hash.replace(/^#/, ""));
};

export const getHashQueryParams = (hash: string): URLSearchParams => {
  const separatorIndex = hash.indexOf("?");
  return new URLSearchParams(
    separatorIndex >= 0 ? hash.slice(separatorIndex + 1) : "",
  );
};

export const buildSectionHash = (
  section: AppSectionId,
  params?: Record<string, string | undefined>,
): string => {
  const query = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.set(key, value);
      }
    });
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";

  if (STANDALONE_SECTION_IDS.includes(section)) {
    return `#${section}${suffix}`;
  }

  return `#section=${encodeURIComponent(section)}${suffix}`;
};

export const isStandaloneSection = (section: AppSectionId): boolean =>
  STANDALONE_SECTION_IDS.includes(section);

export const resolveGuardedSection = (
  section: AppSectionId,
  isAuthenticated: boolean,
  hasAccess = true,
): AppSectionId => {
  if (!isAuthenticated && !PUBLIC_SECTION_IDS.includes(section)) {
    return "landing";
  }

  if (isAuthenticated && AUTH_REDIRECT_SECTION_IDS.includes(section)) {
    return "welcome";
  }

  if (
    isAuthenticated &&
    !hasAccess &&
    !PUBLIC_SECTION_IDS.includes(section) &&
    section !== "welcome"
  ) {
    return "welcome";
  }

  return section;
};

export const navigateToSection = (
  section: AppSectionId,
  params?: Record<string, string | undefined>,
): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.location.hash = buildSectionHash(section, params);
};
