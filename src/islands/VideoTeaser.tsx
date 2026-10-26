import { IconPlayerPlayFilled, IconX } from "@tabler/icons-react";
import { useRef } from "react";

export function VideoTeaser({ label, poster, src }: { label: string; poster?: string; src?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  function close() {
    videoRef.current?.pause();
    dialogRef.current?.close();
  }

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className="group flex w-full flex-col gap-2 text-left">
        <span className="relative block aspect-[317/188] w-full overflow-hidden bg-black/8">
          {poster && <img src={poster} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-black backdrop-blur">
              <IconPlayerPlayFilled size={16} />
            </span>
          </span>
        </span>
        <span className="flex items-center justify-between text-detail uppercase tracking-[0.08em]">
          {label}
          <IconPlayerPlayFilled aria-hidden size={14} />
        </span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={label}
        onClick={(event) => event.target === event.currentTarget && close()}
        onClose={() => videoRef.current?.pause()}
        className="m-auto w-[calc(100%-32px)] max-w-[1240px] bg-transparent backdrop:bg-black/85"
      >
        <div className="relative aspect-video overflow-hidden bg-black">
          {src ? (
            <video ref={videoRef} src={src} poster={poster} controls playsInline className="size-full" />
          ) : poster ? (
            <img src={poster} alt="" className="size-full object-cover" />
          ) : null}
          <button type="button" onClick={close} aria-label="Close video" className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white">
            <IconX size={18} />
          </button>
        </div>
      </dialog>
    </>
  );
}
