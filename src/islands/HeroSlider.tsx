import { IconArrowNarrowLeft, IconArrowNarrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { useState } from "react";
import type { Location } from "@/domain/content";

export function HeroSlider({ slides, id }: { slides: Location[]; id?: string }) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const slide = slides[current];

  function go(delta: number) {
    setCurrent((value) => (value + delta + count) % count);
  }

  if (!slide) return null;

  return (
    <section id={id} aria-roledescription="carousel" aria-label="Our locations" className="relative isolate h-svh max-h-[956px] min-h-[620px] overflow-hidden lg:h-[768px] lg:max-h-none lg:min-h-0">
      {slides.map((item, index) => (
        <img
          key={item.href}
          src={item.image}
          alt={item.name}
          aria-hidden={index !== current}
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 -z-10 size-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      <a
        href={slide.href}
        className="group absolute inset-x-4 bottom-23 flex min-h-[237px] flex-col justify-between bg-white p-6 lg:inset-x-auto lg:top-1/2 lg:right-6 lg:bottom-auto lg:w-[429px] lg:-translate-y-1/2"
      >
        <p className="text-detail uppercase">Our locations</p>
        <div className="flex items-end gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-h4">{slide.name}</h2>
            <p className="mt-1 text-detail">{slide.address}</p>
          </div>
          <span aria-hidden="true" className="flex h-7.5 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:-translate-y-0.5">
            <IconArrowUpRight size={14} stroke={1.75} />
          </span>
        </div>
      </a>

      <div className="absolute inset-x-4 bottom-3 flex h-10 items-center lg:inset-x-auto lg:right-6 lg:bottom-6 lg:w-[429px]">
        <div className="-ml-2 flex" role="group" aria-label={`Slide ${current + 1} of ${count}`}>
          {slides.map((item, index) => (
            <button
              key={item.href}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={`Show ${item.name}`}
              aria-current={index === current}
              className="flex size-6 items-center justify-center"
            >
              <span className={`size-2 rounded-full border border-white transition-colors ${index === current ? "bg-white" : "bg-transparent"}`} />
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-4">
          <button type="button" onClick={() => go(-1)} aria-label="Previous location" className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur">
            <IconArrowNarrowLeft size={18} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next location" className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur">
            <IconArrowNarrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
