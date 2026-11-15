import { IconHome, IconShield, IconStarFilled, IconX } from "@tabler/icons-react";
import { useEffect, useRef } from "react";
import type { Link, PlaceDetails, SpaceAmenity } from "@/domain/content";
import { USE_MEDIA_PLACEHOLDERS } from "@/config/media";
import { wixImageUrl } from "@/lib/wix-image";
import { GoogleMapEmbed } from "@/components/ui/GoogleMapEmbed";

export type Place = {
  title: string;
  image?: string;
  access?: string;
  category?: string;
  address?: string;
  details?: PlaceDetails;
};

const AMENITY_LABELS: Record<SpaceAmenity, string> = { coliving: "Coliving", coworking: "Coworking" };

/**
 * Figma: location detail panel — image with access tag and close button, then category and rating,
 * title, description, price, amenities, map, address and the two actions pinned to the bottom.
 * Used inside other islands (slider, carousel); it is not hydrated on its own.
 */
export function PlaceDialog({ place, onClose, defaultCta }: { place: Place | null; onClose: () => void; defaultCta: Link }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!place) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [place]);

  const details = place?.details;
  const cta = details?.cta ?? defaultCta;

  return (
    <dialog
      ref={dialogRef}
      aria-label={place?.title}
      onClick={(event) => event.target === event.currentTarget && onClose()}
      onClose={onClose}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-[440px] bg-background p-0 backdrop:bg-black/50"
    >
      {place && (
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="relative h-[226px] shrink-0 bg-black/8">
              {USE_MEDIA_PLACEHOLDERS || !place.image ? (
                <span aria-hidden className="absolute inset-0 bg-yellow" />
              ) : (
                <img src={wixImageUrl(place.image, 880)} alt="" decoding="async" className="size-full object-cover" />
              )}
              {place.access && <span className="absolute top-5 left-5 rounded bg-black/60 px-4 py-1 text-detail text-white">{place.access}</span>}
              <button type="button" onClick={onClose} aria-label="Close" className="absolute top-5 right-5 flex size-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur">
                <IconX size={16} stroke={1.75} />
              </button>
            </div>

            <div className="px-5 pt-5 pb-6">
              <div className="flex items-center justify-between gap-4">
                <p className="text-detail uppercase">{details?.category ?? place.category}</p>
                {details?.rating !== undefined && (
                  <p className="flex items-center gap-1.5 text-[0.9375rem]">
                    <IconStarFilled size={16} aria-hidden />
                    <span>
                      <span className="sr-only">Rated </span>
                      {details.rating}/5
                    </span>
                  </p>
                )}
              </div>
              <h2 className="mt-3 font-display text-h4">{place.title}</h2>
              {details?.about && <p className="mt-4 text-[0.9375rem] leading-[1.45]">{details.about}</p>}

              {details?.price && (
                <div className="mt-5">
                  <p className="text-[0.9375rem] text-black/50">{details.price.label}</p>
                  <p className="text-[1.125rem]">{details.price.value}</p>
                </div>
              )}

              {(details?.amenities?.length || place.access) && (
                <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-black/12 pt-5 text-detail text-black/60">
                  {details?.amenities?.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-1.5">
                      <IconHome size={16} stroke={1.25} aria-hidden />
                      {AMENITY_LABELS[amenity]}
                    </li>
                  ))}
                  {place.access && (
                    <li className="flex items-center gap-1.5">
                      <IconShield size={16} stroke={1.25} aria-hidden />
                      {place.access}
                    </li>
                  )}
                </ul>
              )}

              {place.address && (
                <GoogleMapEmbed address={place.address} title={place.title} className="mt-5 h-[220px] rounded-lg" />
              )}

              {place.address && (
                <div className="mt-4 text-[0.9375rem] leading-[1.45]">
                  <p>{place.address}</p>
                  {details?.directions && <p className="text-black/50">{details.directions}</p>}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 justify-center gap-2 px-5 pt-3 pb-6">
            <a href={cta.href} className="inline-flex h-10 min-w-37 items-center justify-center rounded-full bg-black px-6 text-[0.9375rem] text-white">
              {cta.label}
            </a>
            {details?.page && (
              <a href={details.page.href} className="inline-flex h-10 min-w-37 items-center justify-center rounded-full border border-black px-6 text-[0.9375rem]">
                {details.page.label}
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
