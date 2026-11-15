/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly CONTENT_SOURCE?: "fixtures" | "wix";
  readonly CLOUDBEDS_ALLOWED_ORIGIN?: string;
  readonly PUBLIC_GOOGLE_MAPS_EMBED_API_KEY?: string;
  readonly SEO_ALLOW_INDEXING?: "true" | "false";
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
