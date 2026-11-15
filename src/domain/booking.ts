export type Room = {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  occupancyType?: "private" | "shared";
  image?: string;
  description?: string;
  bookingUrl: string;
  /** Extra details shown on the month pages' room cards (Figma "A Room for your Needs"). */
  houseLabel?: string;
  gallery?: string[];
  features?: string[];
  /** Normalized amenities assigned directly to this room category. */
  amenities?: string[];
  /** Shared amenities inherited from the room's CHLocations record. */
  locationAmenities?: string[];
  views?: string;
  floorPlan?: string;
  price?: { label: string; value: string };
  /** Only rooms explicitly opted into public detail routing expose this URL. */
  discoverable?: boolean;
  href?: string;
};

export type RoomDetailPage = Room & {
  discoverable: true;
  href: string;
  gallery: string[];
  seo: { title: string; description: string };
};

export interface BookingProvider {
  getRedirect(room: Room): URL;
}
