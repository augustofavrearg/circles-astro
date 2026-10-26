import type { BookingProvider, Room } from "@/domain/booking";

export function createCloudbedsProvider(allowedOrigin?: string): BookingProvider {
  return {
    getRedirect(room: Room) {
      const url = new URL(room.bookingUrl);
      if (url.protocol !== "https:") {
        throw new Error(`Cloudbeds URL for room "${room.id}" must use HTTPS.`);
      }
      if (allowedOrigin && url.origin !== allowedOrigin) {
        throw new Error(`Cloudbeds URL for room "${room.id}" is not on the configured origin.`);
      }
      return url;
    },
  };
}
