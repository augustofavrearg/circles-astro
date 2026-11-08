import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { useState } from "react";
import { mediaPlaceholderClass, USE_MEDIA_PLACEHOLDERS, type MediaPlaceholderTone } from "@/config/media";

/** Figma "Manifesto" image with previous / next arrows; the arrows only render when there is more than one photo. */
export function ManifestoGallery({ images, label, placeholderTone = "yellow" }: { images: string[]; label: string; placeholderTone?: MediaPlaceholderTone }) {
  const [current, setCurrent] = useState(0);
  const count = images.length;

  if (USE_MEDIA_PLACEHOLDERS || count === 0) return <div className={`size-full ${mediaPlaceholderClass(placeholderTone)}`} />;

  const arrow = "absolute top-1/2 flex h-7 w-12 -translate-y-1/2 items-center justify-center rounded-full transition-opacity disabled:cursor-default";

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label} className="relative size-full overflow-hidden">
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden={index !== current}
          loading="lazy"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${index === current ? "opacity-100" : "opacity-0"}`}
        />
      ))}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => setCurrent((value) => value - 1)}
            disabled={current === 0}
            aria-label="Previous photo"
            className={`${arrow} left-4 bg-white text-black disabled:opacity-40 lg:left-6`}
          >
            <IconArrowNarrowLeft size={16} stroke={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setCurrent((value) => value + 1)}
            disabled={current === count - 1}
            aria-label="Next photo"
            className={`${arrow} right-4 bg-black text-white disabled:opacity-40 lg:right-6`}
          >
            <IconArrowNarrowRight size={16} stroke={1.5} />
          </button>
          <p className="sr-only" aria-live="polite">
            Photo {current + 1} of {count}
          </p>
        </>
      )}
    </div>
  );
}
