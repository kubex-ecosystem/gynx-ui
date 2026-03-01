/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SIMULATE_AUTH: string;
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
