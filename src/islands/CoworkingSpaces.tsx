import {
  IconBarbell,
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconDeviceLaptop,
  IconPrinter,
  IconUsersGroup,
  IconWifi,
} from "@tabler/icons-react";
import { useState } from "react";
import type { CoworkingAmenity, CoworkingPage } from "@/domain/content";
import { alternatingMediaPlaceholder, mediaPlaceholderClass, USE_MEDIA_PLACEHOLDERS } from "@/config/media";
import { wixImageSrcSet, wixImageUrl } from "@/lib/wix-image";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

const ICONS: Record<CoworkingAmenity, typeof IconWifi> = {
  wifi: IconWifi,
  booths: IconDeviceLaptop,
  meeting: IconUsersGroup,
  printing: IconPrinter,
  gym: IconBarbell,
  events: IconCalendarEvent,
  rooftop: IconBuildingSkyscraper,
};

/**
 * Figma "Coworking spaces" (grey band): the selected space expands with its text above a rule,
 * and its photos show on the right with thumbnails.
 */
export function CoworkingSpaces({ eyebrow, items, amenities, cta }: CoworkingPage["spaces"]) {
  const [selected, setSelected] = useState(0);
  const [photo, setPhoto] = useState(0);
  const space = items[selected];
  const images = space?.images ?? [];
  const showPlaceholder = USE_MEDIA_PLACEHOLDERS || !images[photo];

  function choose(index: number) {
    setSelected(index);
    setPhoto(0);
  }

  return (
    <section className="flex flex-col bg-surface px-4 py-6 lg:grid lg:grid-cols-[minmax(0,640px)_536px] lg:justify-between lg:gap-x-12 lg:px-6 lg:py-5">
      <p className="text-detail uppercase lg:hidden">{eyebrow}</p>
      <div className="order-2 flex flex-col lg:order-none">
        <p className="hidden text-detail uppercase lg:block">{eyebrow}</p>
        <ul className="mt-8 lg:mt-auto lg:pt-24">
          {items.map((item, index) => {
            const active = index === selected;
            return (
              <li key={item.title} className={active ? "border-b border-black/60 pb-4" : ""}>
                <InteractiveButton
                  motion="toggle"
                  onClick={() => choose(index)}
                  aria-expanded={active}
                  className={`w-full py-2 text-left font-display text-[2.25rem] lg:text-[1.75rem] leading-[1.3] ${active ? "" : "hover:opacity-60"}`}
                >
                  {item.title}
                </InteractiveButton>
                {active && item.text && <p className="text-[0.8125rem] leading-[1.45]">{item.text}</p>}
              </li>
            );
          })}
        </ul>
        <div className="mt-10 flex flex-col gap-6 border-t border-black/12 pt-4 lg:mt-10 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex max-w-[420px] flex-wrap gap-x-4 gap-y-2 text-[0.8125rem] lg:text-[0.6875rem]">
            {amenities.map((amenity) => {
              const Icon = ICONS[amenity.icon];
              return (
                <li key={amenity.label} className="flex items-center gap-1.5">
                  <Icon size={14} stroke={1.5} aria-hidden />
                  {amenity.label}
                </li>
              );
            })}
          </ul>
          {cta && (
            <a href={cta.href} className="inline-flex h-10 min-w-37 shrink-0 items-center justify-center rounded-full bg-black px-6 text-cta text-white">
              {cta.label}
            </a>
          )}
        </div>
      </div>

      <div className="relative order-1 mt-6 aspect-[408/360] overflow-hidden bg-black/8 lg:order-none lg:mt-0 lg:aspect-[536/600]">
        {showPlaceholder ? (
          <div aria-hidden className={`size-full ${mediaPlaceholderClass(alternatingMediaPlaceholder(selected))}`} />
        ) : (
          <img
            src={wixImageUrl(images[photo], 960)}
            srcSet={wixImageSrcSet(images[photo])}
            sizes="(min-width: 1024px) 536px, 100vw"
            alt={space?.title ?? ""}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        )}
        {!USE_MEDIA_PLACEHOLDERS && images.length > 1 && (
          <div className="absolute bottom-4 left-4 flex gap-2" role="group" aria-label={`${space?.title} photos`}>
            {images.map((src, index) => (
              <InteractiveButton
                motion="toggle"
                key={src}
                onClick={() => setPhoto(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-pressed={index === photo}
                className={`size-12 overflow-hidden ${index === photo ? "outline-2 outline-offset-2 outline-white" : ""}`}
              >
                <img src={wixImageUrl(src, 96)} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
              </InteractiveButton>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
