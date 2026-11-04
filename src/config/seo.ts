export type SeoEnvironment = {
  SEO_ALLOW_INDEXING?: string;
  SITE_URL?: string;
};

export type SeoPolicy = {
  allowIndexing: boolean;
  siteOrigin?: string;
};

/**
 * Indexing is denied unless production explicitly opts in with a valid HTTPS
 * origin. This makes previews, technical Wix hosts and accidental releases safe.
 */
export function getSeoPolicy(environment: SeoEnvironment, requestUrl?: URL): SeoPolicy {
  if (environment.SEO_ALLOW_INDEXING !== "true") return { allowIndexing: false };

  const rawSiteUrl = environment.SITE_URL?.trim();
  if (!rawSiteUrl) throw new Error("SITE_URL is required when SEO_ALLOW_INDEXING=true.");

  let siteUrl: URL;
  try {
    siteUrl = new URL(rawSiteUrl);
  } catch {
    throw new Error("SITE_URL must be a valid absolute URL when SEO_ALLOW_INDEXING=true.");
  }
  if (siteUrl.protocol !== "https:" || siteUrl.username || siteUrl.password || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
    throw new Error("SITE_URL must be an HTTPS origin without credentials, path, query or fragment.");
  }

  if (requestUrl && requestUrl.origin !== siteUrl.origin) {
    return { allowIndexing: false, siteOrigin: siteUrl.origin };
  }
  return { allowIndexing: true, siteOrigin: siteUrl.origin };
}

export function getCanonicalUrl(policy: SeoPolicy, pathname: string): string | undefined {
  if (!policy.allowIndexing || !policy.siteOrigin) return undefined;
  return new URL(pathname, `${policy.siteOrigin}/`).toString();
}

export function getRobotsDirective(policy: SeoPolicy, forceNoIndex = false): string {
  return policy.allowIndexing && !forceNoIndex ? "index,follow" : "noindex,nofollow";
}

export function applySeoResponseHeaders(headers: Headers, policy: SeoPolicy): void {
  if (!policy.allowIndexing) headers.set("X-Robots-Tag", "noindex, nofollow");
}
