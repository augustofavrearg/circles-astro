type RecordValue = Record<string, unknown>;

function asRecord(value: unknown): RecordValue | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : undefined;
}

export function optimizeRicosImages(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(optimizeRicosImages);

  const record = asRecord(value);
  if (!record) return value;

  const optimized = Object.fromEntries(
    Object.entries(record).map(([key, entry]) => [key, optimizeRicosImages(entry)]),
  ) as RecordValue;

  if (optimized.type !== "IMAGE") return optimized;

  const imageData = asRecord(optimized.imageData);
  const image = asRecord(imageData?.image);
  const containerData = asRecord(imageData?.containerData);
  const containerWidth = asRecord(containerData?.width);
  const originalWidth = Number(image?.width);
  const originalHeight = Number(image?.height);
  const displayWidth = Number(containerWidth?.custom);
  if (!image || !Number.isFinite(originalWidth) || !Number.isFinite(originalHeight) || originalWidth <= 0 || originalHeight <= 0) {
    return optimized;
  }

  const requestedWidth = Number.isFinite(displayWidth) && displayWidth > 0
    ? Math.max(320, Math.round(displayWidth * 2))
    : 960;
  const targetWidth = Math.min(originalWidth, requestedWidth, 960);
  if (targetWidth >= originalWidth) return optimized;

  image.width = targetWidth;
  image.height = Math.round(originalHeight * (targetWidth / originalWidth));
  return optimized;
}
