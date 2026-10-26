import { IconArrowNarrowRight, IconMapPin } from "@tabler/icons-react";
import { useState } from "react";
import type { SearchLocation } from "@/domain/content";

export function BookingSearch({ locations }: { locations: SearchLocation[] }) {
  const available = locations.filter((location) => !location.comingSoon);
  const [location, setLocation] = useState(available[0]?.slug ?? "");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    window.location.assign(`/rooms${params.size ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-full items-center gap-2 overflow-hidden rounded-full bg-black/8 p-1.5 lg:max-w-[610px]">
      <label htmlFor="booking-location" className="sr-only">
        Choose a location
      </label>
      <IconMapPin aria-hidden className="ml-3 shrink-0" size={18} stroke={1.5} />
      <select
        id="booking-location"
        value={location}
        onChange={(event) => setLocation(event.target.value)}
        className="w-0 min-w-0 flex-1 appearance-none bg-transparent px-2 py-3 text-body outline-none"
      >
        {available.map((item) => (
          <option key={item.slug} value={item.slug}>
            {item.city}
          </option>
        ))}
      </select>
      <button type="submit" className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-black text-white" aria-label="Choose a room">
        <IconArrowNarrowRight size={18} stroke={1.5} />
      </button>
    </form>
  );
}
