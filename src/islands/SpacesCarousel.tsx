import { IconArrowNarrowLeft, IconArrowNarrowRight, IconMapPin, IconX } from "@tabler/icons-react";
import { useRef, useState } from "react";
import type { Space } from "@/domain/content";

export function SpacesCarousel({ spaces, defaultCta }: { spaces: Space[]; defaultCta: { label: string; href: string } }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selected, setSelected] = useState<Space | null>(null);

  function move(direction: number) {
    trackRef.current?.scrollBy({ left: direction * Math.min(window.innerWidth * 0.8, 560), behavior: "smooth" });
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
      <div className="mb-6 flex justify-end gap-2 px-4 lg:px-6">
        <button type="button" onClick={() => move(-1)} aria-label="Previous spaces" className="flex h-9 w-12 items-center justify-center rounded-full bg-black text-white">
          <IconArrowNarrowLeft size={17} />
        </button>
        <button type="button" onClick={() => move(1)} aria-label="Next spaces" className="flex h-9 w-12 items-center justify-center rounded-full bg-black text-white">
          <IconArrowNarrowRight size={17} />
        </button>
      </div>
      <div ref={trackRef} className="scrollbar-none flex snap-x items-end gap-4 overflow-x-auto px-4 pb-4 lg:px-6">
        {spaces.map((space, index) => (
          <article key={space.title} className={`group shrink-0 snap-start ${index % 3 === 1 ? "w-[84vw] max-w-[540px]" : "w-[72vw] max-w-[360px]"}`}>
            <p className="mb-2 text-detail uppercase tracking-[0.08em]">{space.category}</p>
            <button type="button" onClick={() => open(space)} className={`relative w-full overflow-hidden text-left text-white ${index % 3 === 1 ? "h-[520px]" : "h-[380px]"}`}>
              {space.image && <img src={space.image} alt={space.title} className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />}
              <span className="absolute inset-0 bg-linear-to-b from-black/0 to-black/65" />
              <span className="absolute inset-x-0 bottom-0 p-5">
                <span className="mb-2 flex gap-2 text-detail uppercase">
                  {space.access}
                  {space.comingSoon && <span className="text-red">Coming soon</span>}
                </span>
                <span className="block font-display text-[2.4rem] leading-none">{space.title}</span>
                {space.description && <span className="mt-3 line-clamp-2 block text-body text-white/80">{space.description}</span>}
              </span>
            </button>
          </article>
        ))}
      </div>

      <dialog ref={dialogRef} onClick={(event) => event.target === event.currentTarget && close()} className="m-0 ml-auto h-dvh max-h-none w-full max-w-[470px] bg-background p-0 backdrop:bg-black/50">
        {selected && (
          <div className="flex h-full flex-col">
            <div className="relative h-[38vh] min-h-[260px] shrink-0">
              {selected.image && <img src={selected.image} alt={selected.title} className="size-full object-cover" />}
              <button type="button" onClick={close} aria-label="Close" className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white">
                <IconX size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-detail uppercase tracking-[0.08em]">{selected.category}</p>
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
