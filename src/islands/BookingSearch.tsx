import { IconChevronDown, IconSearch } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SearchLocation } from "@/domain/content";

const GUEST_OPTIONS = [1, 2, 3, 4];

function formatDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Figma: segment with a label, its current value (placeholder in grey) and a chevron. */
function Segment({ label, value, placeholder, className = "", children }: { label: string; value: string; placeholder: string; className?: string; children: ReactNode }) {
  return (
    <label className={`relative flex h-14.5 min-w-0 cursor-pointer items-center gap-2 bg-black/8 px-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-black ${className}`}>
      <span className="flex min-w-0 flex-1 flex-col text-[0.9375rem] leading-[1.45]">
        <span>{label}</span>
        <span className={`truncate ${value ? "text-black" : "text-black/45"}`}>{value || placeholder}</span>
      </span>
      <IconChevronDown aria-hidden size={16} stroke={1.5} className="shrink-0" />
      {children}
    </label>
  );
}

const nativeControl = "absolute inset-0 size-full cursor-pointer appearance-none opacity-0";

/**
 * `fixedLocation`: the location pages' bar (Figma "Location - Barcelona") — dates and guests only,
 * always expanded, stretched to its container.
 */
export function BookingSearch({ locations = [], fixedLocation, className = "" }: { locations?: SearchLocation[]; fixedLocation?: string; className?: string }) {
  const available = locations.filter((location) => !location.comingSoon);
  const [location, setLocation] = useState(fixedLocation ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  // Figma mobile only shows a "Start your search" field; tapping it reveals the full search below lg.
  const [expanded, setExpanded] = useState(false);
  const locationRef = useRef<HTMLSelectElement>(null);
  const locationName = available.find((item) => item.slug === location)?.city ?? "";

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Circles only hands the search over to /rooms; availability and booking stay in Cloudbeds.
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests) params.set("guests", guests);
    window.location.assign(`/rooms${params.size ? `?${params}` : ""}`);
  }

  useEffect(() => {
    if (expanded) locationRef.current?.focus();
  }, [expanded]);

  function showPicker(event: React.MouseEvent<HTMLInputElement>) {
    try {
      event.currentTarget.showPicker();
    } catch {
      // Browsers without showPicker open the native picker on their own.
    }
  }

  return (
    <>
      {!expanded && !fixedLocation && (
        <div className="flex items-center gap-0.5 lg:hidden">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={false}
            aria-controls="booking-search"
            className="flex h-14.5 min-w-0 flex-1 items-center rounded-lg bg-black/12 px-4 text-left text-[0.9375rem] text-black/45"
          >
            Start your search
          </button>
          <a href="/rooms" aria-label="See all rooms" className="inline-flex size-14.5 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <IconSearch size={16} stroke={2} />
          </a>
        </div>
      )}
    <form
      id={fixedLocation ? undefined : "booking-search"}
      onSubmit={submit}
      aria-label="Search stays"
      className={
        fixedLocation
          ? `grid w-full grid-cols-[minmax(0,1fr)_3.625rem] items-center gap-0.75 sm:flex ${className}`
          : `${expanded ? "grid" : "hidden lg:grid"} w-full max-w-[873px] grid-cols-2 gap-0.75 xl:flex xl:items-center ${className}`
      }
    >
      {!fixedLocation && (
        <Segment label="Location" value={locationName} placeholder="Anywhere" className="col-span-2 rounded-lg xl:w-[269px] xl:shrink-0">
          <select ref={locationRef} value={location} onChange={(event) => setLocation(event.target.value)} className={nativeControl}>
            <option value="">Anywhere</option>
            {available.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.city}
              </option>
            ))}
          </select>
        </Segment>
      )}
      <div className={fixedLocation ? "col-span-2 flex min-w-0 gap-px sm:col-span-1 sm:flex-1" : "col-span-2 flex min-w-0 gap-px xl:w-[369px] xl:shrink-0"}>
        <Segment label="Check in" value={formatDate(checkIn)} placeholder="Add dates" className="flex-1 rounded-l-lg">
          <input
            type="date"
            value={checkIn}
            onChange={(event) => {
              setCheckIn(event.target.value);
              if (checkOut && event.target.value >= checkOut) setCheckOut("");
            }}
            onClick={showPicker}
            className={nativeControl}
          />
        </Segment>
        <Segment label="Check out" value={formatDate(checkOut)} placeholder="Add dates" className="flex-1 rounded-r-lg">
          <input type="date" value={checkOut} min={checkIn || undefined} onChange={(event) => setCheckOut(event.target.value)} onClick={showPicker} className={nativeControl} />
        </Segment>
      </div>
      <Segment label="Guests" value={guests} placeholder="1" className={`rounded-lg [&>span>span:first-child]:text-black/45 ${fixedLocation ? "min-w-0 sm:w-[168px] sm:shrink-0" : "xl:w-[168px] xl:shrink-0"}`}>
        <select value={guests} onChange={(event) => setGuests(event.target.value)} className={nativeControl}>
          {GUEST_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </Segment>
      <button type="submit" aria-label="Search rooms" className="inline-flex size-14.5 shrink-0 items-center justify-center justify-self-end rounded-full bg-black text-white xl:ml-px">
        <IconSearch size={16} stroke={2} />
      </button>
    </form>
    </>
  );
}
