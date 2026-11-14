import { RicosViewer, quickStartViewerPlugins } from "@wix/ricos";
import "@wix/ricos/css/all-plugins-viewer.css";

const plugins = quickStartViewerPlugins();

type Props = {
  content: unknown;
  baseUrl: string;
};

export function WixRichContent({ content, baseUrl }: Props) {
  return (
    <RicosViewer
      content={content as Parameters<typeof RicosViewer>[0]["content"]}
      plugins={plugins}
      seoSettings
      jsdomMode
      baseUrl={baseUrl}
      environment="liveSite"
      theme={{
        typography: { fontFamily: '"Avenir Next", "Segoe UI", sans-serif' },
        customStyles: {
          h2: { fontFamily: '"Clash Display", "Helvetica Neue", sans-serif' },
          h3: { fontFamily: '"Clash Display", "Helvetica Neue", sans-serif' },
        },
      }}
    />
  );
}
