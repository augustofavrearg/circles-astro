import { IconArrowNarrowLeft, IconArrowNarrowRight } from "@tabler/icons-react";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

/** Previous / next pills that scroll a static (non-hydrated) track rendered by Astro. */
export function ScrollButtons({ targetId, label, className = "" }: { targetId: string; label: string; className?: string }) {
  function move(direction: number) {
    const track = document.getElementById(targetId);
    track?.scrollBy({ left: direction * Math.min(track.clientWidth * 0.9, 564), behavior: "smooth" });
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      <InteractiveButton onClick={() => move(-1)} aria-controls={targetId} aria-label={`Previous ${label}`} className="flex h-8.5 w-12 items-center justify-center rounded-full bg-black text-white">
        <IconArrowNarrowLeft size={17} />
      </InteractiveButton>
      <InteractiveButton onClick={() => move(1)} aria-controls={targetId} aria-label={`Next ${label}`} className="flex h-8.5 w-12 items-center justify-center rounded-full bg-black text-white">
        <IconArrowNarrowRight size={17} />
      </InteractiveButton>
    </div>
  );
}
