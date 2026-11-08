export const USE_MEDIA_PLACEHOLDERS = true;

export type MediaPlaceholderTone = "yellow" | "blue";

export function mediaPlaceholderClass(tone: MediaPlaceholderTone) {
  return tone === "blue" ? "bg-[#3158d8]" : "bg-yellow";
}

export function alternatingMediaPlaceholder(index: number): MediaPlaceholderTone {
  return index % 2 === 0 ? "yellow" : "blue";
}
