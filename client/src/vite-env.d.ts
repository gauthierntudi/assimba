/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly PROFIL_SOCIAL?: string;
  readonly PRICE_SIMPLE?: string;
  readonly PRICE_PREMIUM?: string;
  readonly PRICE_PRIMIUM?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
