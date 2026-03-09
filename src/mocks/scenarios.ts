export const isSimulatedAuthEnabled = import.meta.env.VITE_SIMULATE_AUTH === 'true';

export const waitMock = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));
