import { IconExternalLink, IconMapPin } from "@tabler/icons-react";
import { googleMapsEmbedUrl, googleMapsSearchUrl } from "@/lib/google-maps";

type Props = {
  address: string;
  title: string;
  mapHref?: string;
  className?: string;
};

export function GoogleMapEmbed({ address, title, mapHref, className = "" }: Props) {
  const embedUrl = googleMapsEmbedUrl(address, import.meta.env.PUBLIC_GOOGLE_MAPS_EMBED_API_KEY);
  const directionsHref = mapHref || googleMapsSearchUrl(address);

  return (
    <div className={`relative min-h-[200px] overflow-hidden bg-[#ebe7dc] ${className}`}>
      {embedUrl ? (
        <iframe
          title={`Map showing ${title}`}
          src={embedUrl}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-red text-black">
            <IconMapPin size={22} stroke={1.5} aria-hidden />
          </span>
          <p className="max-w-md font-display text-lg leading-tight">{address}</p>
        </div>
      )}

      <a
        href={directionsHref}
        target="_blank"
        rel="noreferrer"
        className="absolute right-3 bottom-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white shadow-lg transition-opacity hover:opacity-80"
      >
        <IconExternalLink size={16} stroke={1.5} aria-hidden />
        Open directions
      </a>
    </div>
  );
}
