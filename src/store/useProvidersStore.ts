import { create, StateCreator } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ProviderStatus = 'READY' | 'ERROR' | 'IDLE' | 'TESTING';

export interface ProvidersStore {
  keys: Record<string, string>;
  status: Record<string, ProviderStatus>;
  globalDefault: string;
  expertMode: boolean;
  toolPreferences: Record<string, string>;

  setKey: (providerId: string, key: string) => void;
  removeKey: (providerId: string) => void;
  setStatus: (providerId: string, status: ProviderStatus) => void;
  setGlobalDefault: (providerId: string) => void;
  setExpertMode: (expert: boolean) => void;
  setToolPreference: (toolId: string, providerId: string) => void;
  getDecryptedKey: (providerId: string) => string;
}

// Obfuscação simples para não deixar plaintext estrito no devtools/localstorage
// ATENÇÃO: Nunca use isto para segurança real em produção, mas como o prompt
// pede BYOK (local) é uma precaução mínima de UX.
const obfuscate = (str: string) => btoa(encodeURIComponent(str));
const deobfuscate = (str: string) => {
  try {
    return decodeURIComponent(atob(str));
  } catch (e) {
    return '';
  }
};

export const useProvidersStore = create<ProvidersStore>()(
  persist(
    (set, get) => ({
      keys: {},
      status: {},
      globalDefault: 'openai',
      expertMode: false,
      toolPreferences: {},

      setKey: (providerId: string, key: string) => set((state: ProvidersStore) => ({
        keys: { ...state.keys, [providerId]: obfuscate(key) }
      })),

      removeKey: (providerId: string) => set((state: ProvidersStore) => {
        const newKeys = { ...state.keys };
        delete newKeys[providerId];
        return { keys: newKeys };
      }),

      setStatus: (providerId: string, status: ProviderStatus) => set((state: ProvidersStore) => ({
        status: { ...state.status, [providerId]: status }
      })),

      setGlobalDefault: (globalDefault: string) => set({ globalDefault }),

      setExpertMode: (expertMode: boolean) => set({ expertMode }),

      setToolPreference: (toolId: string, providerId: string) => set((state: ProvidersStore) => ({
        toolPreferences: { ...state.toolPreferences, [toolId]: providerId }
      })),

      getDecryptedKey: (providerId: string) => {
        const { keys } = get();
        const stored = keys[providerId];
        return stored ? deobfuscate(stored) : '';
      }
    }),
    {
      name: 'gnyx-providers-storage',
      storage: createJSONStorage(() => localStorage),
      // Não queremos persistir o estado de 'status' (testing, error), apenas as configs
      partialize: (state: ProvidersStore) => ({
        keys: state.keys,
        globalDefault: state.globalDefault,
        expertMode: state.expertMode,
        toolPreferences: state.toolPreferences
      }),
    }
  )
);
