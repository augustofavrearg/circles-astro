/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTENT_SOURCE?: "fixtures" | "wix";
  readonly CLOUDBEDS_ALLOWED_ORIGIN?: string;
  readonly SEO_ALLOW_INDEXING?: "true" | "false";
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
