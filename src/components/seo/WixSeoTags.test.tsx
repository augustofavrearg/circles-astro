import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { WixSeoTags } from "./WixSeoTags";

describe("WixSeoTags", () => {
  it("keeps structured data but does not forward Wix schema metadata to the DOM", () => {
    const html = renderToStaticMarkup(
      <WixSeoTags
        seoTagsServiceConfig={{
          tags: [{
            type: "script",
            props: { type: "application/ld+json" },
            meta: { schemaType: "BlogPosting", variants: [{ schemaType: "Article" }] },
            children: '{"@type":"BlogPosting"}',
          }],
        } as never}
      />,
    );

    expect(html).toContain('<script type="application/ld+json" wix-seo-tags="true">');
    expect(html).toContain('{"@type":"BlogPosting"}');
    expect(html).not.toContain("schemaType");
    expect(html).not.toContain("schematype");
    expect(html).not.toContain("variants");
  });
});
