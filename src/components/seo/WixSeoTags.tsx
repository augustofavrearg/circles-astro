import type { SEOTagsServiceConfig } from "@wix/headless-seo/services";

type Props = {
  seoTagsServiceConfig: SEOTagsServiceConfig;
};

type DomAttributes = Record<string, string | number | boolean | undefined>;

export function WixSeoTags({ seoTagsServiceConfig }: Props) {
  const wixAttribute = { "wix-seo-tags": "true" };

  return seoTagsServiceConfig.tags
    .filter((tag) => !tag.disabled)
    .map((tag, index) => {
      const props = (tag.props ?? {}) as DomAttributes;

      if (tag.type === "title") {
        return <title {...wixAttribute} key={`title-${index}`}>{tag.children}</title>;
      }
      if (tag.type === "meta") {
        return <meta {...props} {...wixAttribute} key={`meta-${index}`} />;
      }
      if (tag.type === "link") {
        return <link {...props} {...wixAttribute} key={`link-${index}`} />;
      }
      if (tag.type === "script") {
        return (
          <script
            {...props}
            {...wixAttribute}
            dangerouslySetInnerHTML={{ __html: tag.children || "" }}
            key={`script-${index}`}
          />
        );
      }
      return null;
    });
}
