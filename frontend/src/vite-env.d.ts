/// <reference types="vite/client" />

/** Typed so `import.meta.env` reads are not `any` — see src/config/env.ts. */
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SOCKET_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
