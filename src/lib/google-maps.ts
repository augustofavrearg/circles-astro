export function googleMapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function googleMapsEmbedUrl(address: string, apiKey?: string): string | undefined {
  const key = apiKey?.trim();
  const query = address.trim();
  if (!key || !query) return undefined;

  const parameters = new URLSearchParams({ key, q: query, language: "en" });
  return `https://www.google.com/maps/embed/v1/place?${parameters.toString()}`;
}
