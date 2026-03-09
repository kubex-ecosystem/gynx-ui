import { isSimulatedAuthEnabled as readSimulatedAuthEnabled } from '@/core/runtime/mode';

export const isSimulatedAuthEnabled = readSimulatedAuthEnabled();

export const waitMock = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));
