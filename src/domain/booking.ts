export type Room = {
  id: string;
  name: string;
  locationId: string;
  locationName: string;
  image?: string;
  description?: string;
  bookingUrl: string;
};

export interface BookingProvider {
  getRedirect(room: Room): URL;
}
