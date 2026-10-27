import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { HomePage, Link, Space } from "@/domain/content";
import { PlaceDialog, type Place } from "./PlaceDialog";

type SizedSpace = HomePage["network"]["spaces"][number];

/** Figma card sizes; mobile uses the same ones and lets the track scroll. */
const SIZES: Record<SizedSpace["size"], { card: string; image: string }> = {
  large: { card: "w-[540px]", image: "h-[488px]" },
  medium: { card: "w-[316px]", image: "h-[388px]" },
  small: { card: "w-[316px]", image: "h-[232px]" },
};

export function SpacesCarousel({ spaces, defaultCta, children }: { spaces: SizedSpace[]; defaultCta: Link; children?: ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Place | null>(null);

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
    const { title, image, access, category, address, description, details } = space;
    setSelected({ title, image, access, category, address, details: { ...details, about: details?.about ?? description } });
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

      <PlaceDialog place={selected} onClose={() => setSelected(null)} defaultCta={defaultCta} />
    </>
  );
}
