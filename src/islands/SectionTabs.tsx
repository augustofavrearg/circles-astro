import { useEffect, useState } from "react";
import type { Link } from "@/domain/content";

/** Figma location pages: sticky in-page tabs; the section in view is underlined. */
export function SectionTabs({ tabs, label }: { tabs: Link[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.href);

  useEffect(() => {
    const sections = tabs.map((tab) => document.querySelector(tab.href)).filter((element): element is Element => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [tabs]);

  return (
    <nav aria-label={label} className="sticky top-18 z-40 border-b border-black/12 bg-background/95 backdrop-blur-md">
      <ul className="scrollbar-none flex gap-8 overflow-x-auto px-4 lg:justify-center lg:gap-14 lg:px-6">
        {tabs.map((tab) => (
          <li key={tab.href} className="shrink-0">
            <a
              href={tab.href}
              aria-current={active === tab.href ? "location" : undefined}
              className={`block border-b py-3 text-[0.9375rem] transition-colors lg:text-[1rem] ${active === tab.href ? "border-black" : "border-transparent text-black/80 hover:border-black/30"}`}
            >
              {tab.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
