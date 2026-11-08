import { useMemo, useState } from "react";
import type { CircleEvent } from "@/domain/content";
import { alternatingMediaPlaceholder, mediaPlaceholderClass, USE_MEDIA_PLACEHOLDERS } from "@/config/media";

/** `initialCity`: the city selected on load (the location pages start on their own city). */
export function EventsFilter({ events, cities, initialCity = "all" }: { events: CircleEvent[]; cities: string[]; initialCity?: string }) {
  const [city, setCity] = useState(initialCity);
  const visible = useMemo(() => (city === "all" ? events : events.filter((event) => event.city === city)), [city, events]);

  return (
    <div>
      <div className="flex justify-center px-4 lg:justify-start lg:px-6">
        <div className="inline-flex rounded-lg bg-black/8 p-0.5" role="group" aria-label="Filter events by city">
          {["all", ...cities].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCity(option)}
              aria-pressed={city === option}
              className={`h-6.5 min-w-22 rounded-md px-4 text-detail transition-colors ${city === option ? "bg-black text-white" : "text-black/45 hover:text-black"}`}
            >
              {option === "all" ? "All" : option}
            </button>
          ))}
        </div>
      </div>
      <div className="scrollbar-none mt-20 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-3 lg:mt-18 lg:scroll-px-6 lg:gap-12 lg:px-6">
        {visible.map((event, index) => (
          <article
            key={`${event.city}-${event.title}`}
            className="group relative h-[680px] w-[389px] max-w-[calc(100vw-3rem)] shrink-0 snap-start overflow-hidden lg:h-[720px] lg:w-[540px] lg:max-w-none"
          >
            {USE_MEDIA_PLACEHOLDERS || !event.image ? (
              <span aria-hidden className={`absolute inset-0 ${mediaPlaceholderClass(alternatingMediaPlaceholder(index))}`} />
            ) : (
              <img src={event.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
            )}
            <span className="absolute top-4 left-4 rounded bg-black/60 px-4 py-1 text-detail text-white transition-all duration-300 lg:top-8 lg:left-8 lg:group-hover:top-4 lg:group-hover:left-4">
              {event.access}
            </span>
            <div className="absolute inset-x-4 bottom-4 bg-white p-6 transition-all duration-300 lg:inset-x-8 lg:bottom-8 lg:group-hover:inset-x-4 lg:group-hover:bottom-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-14 shrink-0 flex-col items-center justify-center rounded-xs bg-red text-[0.9375rem] leading-none text-white">
                  <span>{event.month}</span>
                  <span>{event.day}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-[0.9375rem]">{event.dateLabel}</p>
                  <p className="text-detail text-black/50">{event.timeLabel}</p>
                </div>
              </div>
              <h3 className="mt-7 font-display text-[2rem] leading-[1.15] lg:text-[2.5rem]">{event.title}</h3>
              <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-300 lg:grid-rows-[0fr] lg:group-hover:grid-rows-[1fr]">
                <p className="overflow-hidden text-body text-black/60">
                  <span className="block pt-3">{event.description}</span>
                  {event.cta && (
                    <a href={event.cta.href} className="mt-6 inline-flex h-10 min-w-37 items-center justify-center rounded-full bg-black px-6 text-cta text-white">
                      {event.cta.label}
                    </a>
                  )}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
