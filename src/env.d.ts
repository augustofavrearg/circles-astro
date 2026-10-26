/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTENT_SOURCE?: "fixtures" | "wix";
  readonly CLOUDBEDS_ALLOWED_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
