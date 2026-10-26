import { IconMenu2, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Link } from "@/domain/content";

export function HeaderMenu({ nav, login, book }: { nav: Link[]; login: Link; book: Link }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/12 bg-background/95 backdrop-blur-md">
      <div className="flex h-18 items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex size-10 items-center justify-center rounded-full bg-black/8 lg:hidden"
        >
          {open ? <IconX size={18} /> : <IconMenu2 size={18} />}
        </button>

        <a href="/" aria-label="Circles House — home" className="font-display text-[2rem] leading-none tracking-[-0.07em]">
          circles
        </a>

        <nav aria-label="Main" className="ml-12 hidden flex-1 items-center gap-7 lg:flex">
          {nav.map((link) => (
            <a key={link.href} href={link.href} className="text-cta transition-opacity hover:opacity-50">
              {link.label}
            </a>
          ))}
        </nav>

        <a href={login.href} className="ml-auto hidden h-10 items-center rounded-full border border-black px-6 text-cta lg:inline-flex">
          {login.label}
        </a>
        <a href={book.href} className="inline-flex h-10 items-center rounded-full bg-black px-5 text-cta text-white">
          {book.label}
        </a>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full h-[calc(100dvh-72px)] overflow-y-auto bg-background lg:hidden"
      >
        <nav aria-label="Mobile" className="flex min-h-full flex-col gap-5 px-4 py-10">
          {nav.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-black/12 py-3 font-display text-[2.5rem] leading-none"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              {link.label}
            </a>
          ))}
          <a href={login.href} className="mt-auto inline-flex h-11 w-fit items-center rounded-full border border-black px-6">
            {login.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
