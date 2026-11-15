import { IconArrowNarrowLeft, IconArrowNarrowRight, IconArrowUpRight } from "@tabler/icons-react";
import { useState } from "react";
import type { Link, Location } from "@/domain/content";
import { alternatingMediaPlaceholder, mediaPlaceholderClass, USE_MEDIA_PLACEHOLDERS } from "@/config/media";
import { PlaceDialog, type Place } from "./PlaceDialog";
import { wixImageSrcSet, wixImageUrl } from "@/lib/wix-image";

const CARD_CLASS =
  "group absolute inset-x-4 bottom-23 flex min-h-[237px] flex-col justify-between bg-white p-6 lg:inset-x-auto lg:top-1/2 lg:right-6 lg:bottom-auto lg:w-[429px] lg:-translate-y-1/2";

/** Slider card content; spans only, so it is valid inside both a link and a button. */
function CardBody({ slide }: { slide: Location }) {
  return (
    <>
      <span className="text-detail uppercase">Our locations</span>
      <span className="flex items-end gap-4">
        <span className="min-w-0 flex-1">
          <span className="block font-display text-h4">{slide.name}</span>
          <span className="mt-1 block text-detail">{slide.address}</span>
        </span>
        <span aria-hidden="true" className="flex h-7.5 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white transition-transform group-hover:-translate-y-0.5">
          <IconArrowUpRight size={14} stroke={1.75} />
        </span>
      </span>
    </>
  );
}

export function HeroSlider({ slides, id, defaultCta }: { slides: Location[]; id?: string; defaultCta: Link }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Place | null>(null);
  const count = slides.length;
  const slide = slides[current];

  function go(delta: number) {
    setCurrent((value) => (value + delta + count) % count);
  }

  if (!slide) return null;

  return (
    <section id={id} aria-roledescription="carousel" aria-label="Our locations" className="relative isolate h-svh max-h-[956px] min-h-[620px] overflow-hidden lg:h-[768px] lg:max-h-none lg:min-h-0">
      {USE_MEDIA_PLACEHOLDERS || !slide.image ? (
          <span
            key={slide.href}
            aria-hidden="true"
            className={`absolute inset-0 -z-10 ${mediaPlaceholderClass(alternatingMediaPlaceholder(current))}`}
          />
        ) : (
          <img
            key={slide.href}
            src={wixImageUrl(slide.image, 1600)}
            srcSet={wixImageSrcSet(slide.image)}
            sizes="100vw"
            alt={slide.name}
            loading={current === 0 ? "eager" : "lazy"}
            decoding="async"
            className="absolute inset-0 -z-10 size-full object-cover"
          />
        )}

      {slide.details ? (
        <button type="button" aria-haspopup="dialog" onClick={() => setSelected({ title: slide.name, image: slide.image, access: slide.access, address: slide.address, details: slide.details })} className={`${CARD_CLASS} text-left`}>
          <CardBody slide={slide} />
        </button>
      ) : (
        <a href={slide.href} className={CARD_CLASS}>
          <CardBody slide={slide} />
        </a>
      )}

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
      <PlaceDialog place={selected} onClose={() => setSelected(null)} defaultCta={defaultCta} />
    </section>
  );
}
