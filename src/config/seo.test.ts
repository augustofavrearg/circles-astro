import { describe, expect, it } from "vitest";
import { applySeoResponseHeaders, getCanonicalUrl, getRobotsDirective, getSeoPolicy } from "./seo";

describe("SEO environment policy", () => {
  it("denies indexing by default", () => {
    const policy = getSeoPolicy({});
    expect(policy).toEqual({ allowIndexing: false });
    expect(getRobotsDirective(policy)).toBe("noindex,nofollow");
    expect(getCanonicalUrl(policy, "/locations/barcelona")).toBeUndefined();
  });

  it("does not enable indexing when only SITE_URL is configured", () => {
    expect(getSeoPolicy({ SITE_URL: "https://www.circles.house" })).toEqual({ allowIndexing: false });
  });

  it("requires an explicit flag and a safe production origin", () => {
    const policy = getSeoPolicy({ SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house" });
    expect(policy).toEqual({ allowIndexing: true, siteOrigin: "https://www.circles.house" });
    expect(getRobotsDirective(policy)).toBe("index,follow");
    expect(getCanonicalUrl(policy, "/events/barcelona")).toBe("https://www.circles.house/events/barcelona");
  });

  it("keeps explicitly excluded pages out of search in production", () => {
    const policy = getSeoPolicy({ SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house" });
    expect(getRobotsDirective(policy, true)).toBe("noindex,nofollow");
  });

  it("keeps Wix previews blocked even when production indexing is enabled", () => {
    const policy = getSeoPolicy(
      { SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house" },
      new URL("https://technical-preview.wix-site-host.com/locations/barcelona"),
    );
    expect(policy).toEqual({ allowIndexing: false, siteOrigin: "https://www.circles.house" });
    expect(getRobotsDirective(policy)).toBe("noindex,nofollow");
    expect(getCanonicalUrl(policy, "/locations/barcelona")).toBeUndefined();
  });

  it("allows indexing only on the configured production host", () => {
    const policy = getSeoPolicy(
      { SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house" },
      new URL("https://www.circles.house/events"),
    );
    expect(policy.allowIndexing).toBe(true);
  });

  it("fails closed when production indexing is misconfigured", () => {
    expect(() => getSeoPolicy({ SEO_ALLOW_INDEXING: "true" })).toThrow(/SITE_URL is required/);
    expect(() => getSeoPolicy({ SEO_ALLOW_INDEXING: "true", SITE_URL: "http://www.circles.house" })).toThrow(/HTTPS origin/);
    expect(() => getSeoPolicy({ SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house/staging" })).toThrow(/HTTPS origin/);
  });

  it("adds the HTTP noindex barrier outside production", () => {
    const headers = new Headers();
    applySeoResponseHeaders(headers, getSeoPolicy({}));
    expect(headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it("does not block responses after the explicit production opt-in", () => {
    const headers = new Headers();
    applySeoResponseHeaders(headers, getSeoPolicy({ SEO_ALLOW_INDEXING: "true", SITE_URL: "https://www.circles.house" }));
    expect(headers.has("X-Robots-Tag")).toBe(false);
  });
});
