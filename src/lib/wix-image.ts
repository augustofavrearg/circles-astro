const RESPONSIVE_WIDTHS = [320, 640, 960, 1280, 1600, 2000] as const;

export function wixImageUrl(source: string | undefined, width: number): string | undefined {
  if (!source) return undefined;

  let url: URL;
  try {
    url = new URL(source);
  } catch {
    return source;
  }

  if (url.hostname !== "static.wixstatic.com" || !url.pathname.startsWith("/media/") || url.pathname.includes("/v1/")) {
    return source;
  }

  const safeWidth = Math.max(1, Math.round(width));
  const filename = url.pathname.split("/").filter(Boolean).at(-1) || "image";
  url.pathname = `${url.pathname}/v1/fit/w_${safeWidth},h_8000,al_c,q_75,enc_auto/${filename}`;
  return url.toString();
}

export function wixImageSrcSet(source: string | undefined): string | undefined {
  if (!source || wixImageUrl(source, RESPONSIVE_WIDTHS[0]) === source) return undefined;
  return RESPONSIVE_WIDTHS.map((width) => `${wixImageUrl(source, width)} ${width}w`).join(", ");
}
