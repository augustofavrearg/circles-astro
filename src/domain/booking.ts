export type Room = {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  image?: string;
  description?: string;
  bookingUrl: string;
  /** Extra details shown on the month pages' room cards (Figma "A Room for your Needs"). */
  houseLabel?: string;
  gallery?: string[];
  features?: string[];
  views?: string;
  floorPlan?: string;
  price?: { label: string; value: string };
};

export interface BookingProvider {
  getRedirect(room: Room): URL;
}
