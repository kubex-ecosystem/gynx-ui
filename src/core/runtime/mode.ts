const isTruthyFlag = (value?: string): boolean => value === "true";

const readProcessEnv = (key: string): string | undefined => {
  if (typeof process === "undefined" || !process.env) {
    return undefined;
  }

  return process.env[key];
};

const readQueryFlag = (...keys: string[]): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const params = new URLSearchParams(window.location.search);
  return keys.some((key) => params.get(key) === "true");
};

export interface FrontendRuntimeFlags {
  demoMode: boolean;
  simulatedAuth: boolean;
}

export const getFrontendRuntimeFlags = (): FrontendRuntimeFlags => {
  const demoMode =
    isTruthyFlag(import.meta.env.VITE_DEMO_MODE) ||
    isTruthyFlag(readProcessEnv("VITE_DEMO_MODE")) ||
    isTruthyFlag(readProcessEnv("DEMO_MODE")) ||
    readQueryFlag("demo_mode", "demoMode");

  const simulatedAuth =
    isTruthyFlag(import.meta.env.VITE_SIMULATE_AUTH) ||
    isTruthyFlag(readProcessEnv("VITE_SIMULATE_AUTH")) ||
    readQueryFlag("simulate_auth", "simulateAuth") ||
    demoMode;

  return {
    demoMode,
    simulatedAuth,
  };
};

export const isDemoModeEnabled = (backendDemoMode?: boolean): boolean => {
  const runtimeFlags = getFrontendRuntimeFlags();
  return Boolean(backendDemoMode) || runtimeFlags.demoMode || runtimeFlags.simulatedAuth;
};

export const isSimulatedAuthEnabled = (): boolean => getFrontendRuntimeFlags().simulatedAuth;
