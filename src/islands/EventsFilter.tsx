import { useMemo, useState } from "react";
import type { CircleEvent } from "@/domain/content";

export function EventsFilter({ events, cities }: { events: CircleEvent[]; cities: string[] }) {
  const [city, setCity] = useState("all");
  const visible = useMemo(() => (city === "all" ? events : events.filter((event) => event.city === city)), [city, events]);

  return (
    <div>
      <div className="mb-8 flex gap-1 overflow-x-auto px-4 lg:px-6" role="group" aria-label="Filter events by city">
        {["all", ...cities].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setCity(option)}
            className={`h-9 rounded-full px-5 text-cta ${city === option ? "bg-black text-white" : "bg-black/8"}`}
          >
            {option === "all" ? "All" : option}
          </button>
        ))}
      </div>
      <div className="scrollbar-none flex snap-x gap-4 overflow-x-auto px-4 pb-3 lg:px-6">
        {visible.map((event) => (
          <article key={`${event.city}-${event.title}`} className="relative flex h-[610px] w-[86vw] max-w-[540px] shrink-0 snap-start flex-col justify-end overflow-hidden p-4 lg:p-8">
            {event.image && <img src={event.image} alt={event.title} className="absolute inset-0 size-full object-cover" />}
            <div className="absolute inset-0 bg-linear-to-b from-black/5 to-black/55" />
            <span className="absolute top-4 left-4 rounded-full bg-white px-3 py-2 text-detail lg:top-8 lg:left-8">{event.access}</span>
            <div className="relative bg-white p-6">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex size-14 shrink-0 flex-col items-center justify-center border border-black/12">
                  <span className="text-detail uppercase">{event.month}</span>
                  <strong className="font-display text-h3">{event.day}</strong>
                </div>
                <div>
                  <p className="text-cta">{event.dateLabel}</p>
                  <p className="mt-1 text-detail text-black/50">{event.timeLabel}</p>
                </div>
              </div>
              <h3 className="font-display text-[2rem] leading-none">{event.title}</h3>
              <p className="mt-3 line-clamp-3 text-body text-black/60">{event.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
