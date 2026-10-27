import { IconArrowNarrowLeft, IconArrowNarrowRight, IconMapPin, IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HomePage, Space } from "@/domain/content";

type SizedSpace = HomePage["network"]["spaces"][number];

/** Figma card sizes; mobile uses the same ones and lets the track scroll. */
const SIZES: Record<SizedSpace["size"], { card: string; image: string }> = {
  large: { card: "w-[540px]", image: "h-[488px]" },
  medium: { card: "w-[316px]", image: "h-[388px]" },
  small: { card: "w-[316px]", image: "h-[232px]" },
};

export function SpacesCarousel({ spaces, defaultCta, children }: { spaces: SizedSpace[]; defaultCta: { label: string; href: string }; children?: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Space | null>(null);

  // Figma's resting state on desktop: the second card starts at ~17% of the width, so the first one peeks in.
  useEffect(() => {
    const track = trackRef.current;
    const second = track?.children[1] as HTMLElement | undefined;
    if (!track || !second || !window.matchMedia("(min-width: 64rem)").matches) return;
    track.scrollLeft = Math.max(0, second.offsetLeft - Math.round(track.clientWidth * 0.17));
  }, []);

  function move(direction: number) {
    trackRef.current?.scrollBy({ left: direction * Math.min(window.innerWidth * 0.8, 564), behavior: "smooth" });
  }

  function open(space: Space) {
    setSelected(space);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
    setSelected(null);
  }

  return (
    <>
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end lg:gap-4 lg:pr-6">
        <div className="w-full min-w-0 lg:flex-1">{children}</div>
        <div className="flex shrink-0 gap-4 lg:pb-2">
          <button type="button" onClick={() => move(-1)} aria-label="Previous spaces" className="flex h-8.5 w-12 items-center justify-center rounded-full bg-black text-white">
            <IconArrowNarrowLeft size={17} />
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Next spaces" className="flex h-8.5 w-12 items-center justify-center rounded-full bg-black text-white">
            <IconArrowNarrowRight size={17} />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="scrollbar-none mt-28 flex snap-x scroll-px-4 items-center gap-12 overflow-x-auto px-4 pb-4 lg:mt-20 lg:snap-none lg:px-6">
        {spaces.map((space) => {
          const size = SIZES[space.size];
          return (
            <article key={space.title} className={`group shrink-0 snap-start ${size.card}`}>
              <p className="mb-1.5 flex gap-2 text-detail uppercase">
                {space.category}
                {space.comingSoon && <span className="text-red">Coming soon</span>}
              </p>
              <button type="button" onClick={() => open(space)} aria-haspopup="dialog" className={`relative block w-full overflow-hidden text-left text-white ${size.image}`}>
                {space.image && <img src={space.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-linear-to-b from-black/0 from-55% to-black/40" />
                <span className="absolute inset-x-0 bottom-0 p-4 font-display text-h4">{space.title}</span>
              </button>
            </article>
          );
        })}
      </div>

      <dialog ref={dialogRef} onClick={(event) => event.target === event.currentTarget && close()} onClose={() => setSelected(null)} className="m-0 ml-auto h-dvh max-h-none w-full max-w-[470px] bg-background p-0 backdrop:bg-black/50">
        {selected && (
          <div className="flex h-full flex-col">
            <div className="relative h-[38vh] min-h-[260px] shrink-0">
              {selected.image && <img src={selected.image} alt={selected.title} className="size-full object-cover" />}
              <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white">
                <IconX size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-detail uppercase">{selected.category}</p>
              <h2 className="mt-3 font-display text-h2">{selected.title}</h2>
              <p className="mt-6 text-body">{selected.details?.about ?? selected.description}</p>
              {selected.details?.price && (
                <div className="mt-8 border-t border-black/12 pt-5">
                  <p className="text-detail text-black/50">{selected.details.price.label}</p>
                  <p className="mt-1 font-display text-h3">{selected.details.price.value}</p>
                </div>
              )}
              {selected.address && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.address)}`} target="_blank" rel="noreferrer" className="mt-8 flex items-center gap-2 text-cta">
                  <IconMapPin size={17} /> {selected.address}
                </a>
              )}
            </div>
            <div className="flex gap-2 border-t border-black/12 p-4">
              {selected.details?.page && <a href={selected.details.page.href} className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-black">{selected.details.page.label}</a>}
              <a href={selected.details?.cta?.href ?? defaultCta.href} className="inline-flex h-11 flex-1 items-center justify-center rounded-full bg-black text-white">{selected.details?.cta?.label ?? defaultCta.label}</a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
