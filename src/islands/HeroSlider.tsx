import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useState } from "react";
import type { Location } from "@/domain/content";

export function HeroSlider({ slides }: { slides: Location[] }) {
  const [current, setCurrent] = useState(0);
  const count = slides.length;
  const slide = slides[current];

  function go(delta: number) {
    setCurrent((value) => (value + delta + count) % count);
  }

  if (!slide) return null;

  return (
    <section aria-roledescription="carousel" aria-label="Our locations" className="relative isolate flex h-[82svh] min-h-[620px] flex-col justify-end overflow-hidden p-4 lg:h-[768px] lg:p-6">
      {slides.map((item, index) => (
        <img
          key={item.href}
          src={item.image}
          alt={item.name}
          aria-hidden={index !== current}
          className={`absolute inset-0 -z-10 size-full object-cover transition-opacity duration-700 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      <div className="ml-auto flex w-full max-w-[430px] flex-col gap-3">
        <a href={slide.href} className="group flex min-h-[238px] flex-col justify-between bg-background p-6">
          <p className="text-detail uppercase tracking-[0.08em]">Our locations</p>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <h2 className="font-display text-h2">{slide.name}</h2>
              <p className="mt-2 text-detail">{slide.address}</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:rotate-45">
              <IconArrowNarrowRight size={17} />
            </span>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <div className="flex flex-1 gap-1.5" aria-label={`Slide ${current + 1} of ${count}`}>
            {slides.map((item, index) => (
              <button
                key={item.href}
                type="button"
                onClick={() => setCurrent(index)}
                aria-label={`Show ${item.name}`}
                className={`h-1 flex-1 transition-colors ${index === current ? "bg-white" : "bg-white/30"}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(-1)} aria-label="Previous location" className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur">
            <IconArrowNarrowLeft size={18} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next location" className="flex size-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur">
            <IconArrowNarrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
