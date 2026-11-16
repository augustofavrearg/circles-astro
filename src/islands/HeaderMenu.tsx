import { IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";
import { InteractiveButton } from "@/components/ui/InteractiveButton";
import { useEffect, useId, useRef, useState } from "react";
import type { HeaderNavigation, NavigationItem, NavigationLink } from "@/domain/navigation";
import { isNavigationLink, isPathCurrent, isVisibleNavigationItem } from "@/domain/navigation";
import { routes } from "@/config/navigation";
import { wixImageUrl } from "@/lib/wix-image";

type Props = {
  navigation: HeaderNavigation;
  currentPath: string;
};

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function hasCurrentDestination(item: NavigationLink, currentPath: string) {
  if (isPathCurrent(currentPath, item.href)) return true;
  return item.children?.some((child) => isNavigationLink(child) && isPathCurrent(currentPath, child.href)) ?? false;
}

function visibleChildren(item: NavigationLink) {
  return item.children?.filter(isVisibleNavigationItem) ?? [];
}

function happeningGroups(children: NavigationItem[]) {
  return [
    { label: "Events", items: children.filter((child) => isNavigationLink(child) && child.href.startsWith("/events")) },
    { label: "Programs", items: children.filter((child) => isNavigationLink(child) && child.href.startsWith("/programs/")) },
  ].filter((group) => group.items.length > 0);
}

function MenuItem({ item, currentPath, onNavigate }: { item: NavigationItem; currentPath: string; onNavigate: () => void }) {
  if (item.status === "hidden") return null;

  if (item.status === "comingSoon") {
    return (
      <span aria-disabled="true" className="flex items-center gap-2 text-black/55">
        <span>{item.label}</span>
        <span className="font-sans text-[0.6875rem] uppercase tracking-[0.04em] text-red">{item.badge ?? "Coming soon"}</span>
      </span>
    );
  }

  return (
    <a
      href={item.href}
      aria-current={isPathCurrent(currentPath, item.href) ? "page" : undefined}
      onClick={onNavigate}
      className={`w-fit transition-opacity hover:opacity-50 ${isPathCurrent(currentPath, item.href) ? "underline underline-offset-4" : ""}`}
    >
      {item.label}
    </a>
  );
}

function LocationMenuItem({ item, currentPath, onNavigate }: { item: NavigationItem; currentPath: string; onNavigate: () => void }) {
  if (item.status === "hidden") return null;

  const content = (
    <>
      {item.image && (
        <span className="size-20 shrink-0 overflow-hidden">
          <img src={wixImageUrl(item.image, 160)} alt="" width="80" height="80" loading="lazy" decoding="async" className="size-20 object-cover" />
        </span>
      )}
      <span className="font-display text-lg leading-none">
        {item.label}
        {item.status === "comingSoon" && <span className="text-black/60"> ({item.badge ?? "Coming soon"})</span>}
      </span>
    </>
  );

  if (isNavigationLink(item)) {
    return (
      <a
        href={item.href}
        aria-current={isPathCurrent(currentPath, item.href) ? "page" : undefined}
        onClick={onNavigate}
        className={`flex h-20 items-center gap-2 transition-opacity hover:opacity-60 ${isPathCurrent(currentPath, item.href) ? "underline underline-offset-4" : ""}`}
      >
        {content}
      </a>
    );
  }

  return (
    <span aria-disabled="true" className="flex h-20 items-center gap-2">
      {content}
    </span>
  );
}

function DesktopDropdown({ item, panelId, currentPath, onNavigate }: { item: NavigationLink; panelId: string; currentPath: string; onNavigate: () => void }) {
  const children = visibleChildren(item);
  if (children.length === 0) return null;
  const locations = children.some((child) => child.image);
  const happening = item.href === routes.events;

  return (
    <div
      id={panelId}
      role="group"
      aria-label={`${item.label} submenu`}
      className={`absolute left-0 top-[calc(100%+16px)] z-20 rounded-lg bg-white p-4 shadow-[0_16px_45px_rgba(0,0,0,0.12)] before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:content-[''] ${locations ? "w-[428px]" : happening ? "w-max min-w-[410px]" : "w-max min-w-[186px] pr-12"}`}
    >
      {locations ? (
        <>
          <p className="mb-6 text-xs leading-none">{item.menuLabel ?? item.label}</p>
          <div className="flex flex-col gap-6">
            {children.map((child) => <LocationMenuItem key={child.label} item={child} currentPath={currentPath} onNavigate={onNavigate} />)}
          </div>
        </>
      ) : happening ? (
        <div className="grid grid-cols-3 gap-8 whitespace-nowrap">
          {happeningGroups(children).map((group) => (
            <div key={group.label}>
              <p className="mb-4 text-xs leading-none text-black/45">{group.label}</p>
              <div className="flex flex-col gap-4 font-display text-lg leading-[1.22]">
                {group.items.map((child) => <MenuItem key={child.label} item={child} currentPath={currentPath} onNavigate={onNavigate} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4 whitespace-nowrap font-display text-lg leading-[1.22]">
          {children.map((child) => <MenuItem key={child.label} item={child} currentPath={currentPath} onNavigate={onNavigate} />)}
        </div>
      )}
    </div>
  );
}

export function HeaderMenu({ navigation, currentPath }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [mobileMenuTop, setMobileMenuTop] = useState(72);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const desktopTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const idPrefix = useId().replace(/:/g, "");
  const nav = navigation.primary.filter(isVisibleNavigationItem);
  const locations = navigation.locations.filter(isVisibleNavigationItem);
  const book = navigation.actions.book;

  const closeMobile = () => {
    setMobileOpen(false);
    setMobileSection(null);
  };

  const closeDesktop = () => setDesktopOpen(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) closeDesktop();
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  useEffect(() => {
    if (!mobileOpen && !desktopOpen) return;

    const previous = document.body.style.overflow;
    if (mobileOpen) document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (mobileOpen) {
          closeMobile();
          mobileButtonRef.current?.focus();
        }
        const openMenu = desktopOpen;
        closeDesktop();
        if (openMenu) window.requestAnimationFrame(() => desktopTriggerRefs.current[openMenu]?.focus());
        return;
      }

      if (event.key !== "Tab" || !mobileOpen || !headerRef.current) return;
      const focusable = Array.from(headerRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [desktopOpen, mobileOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 85.375rem)");
    const onChange = () => {
      if (desktop.matches) closeMobile();
      else closeDesktop();
    };
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const syncMenuTop = () => setMobileMenuTop(headerRef.current?.getBoundingClientRect().bottom ?? 72);
    syncMenuTop();
    window.addEventListener("resize", syncMenuTop);
    return () => window.removeEventListener("resize", syncMenuTop);
  }, [mobileOpen]);

  const focusFirstPanelItem = (panelId: string) => {
    window.requestAnimationFrame(() => document.getElementById(panelId)?.querySelector<HTMLElement>(focusableSelector)?.focus());
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-black/12 bg-background">
      <div className="flex h-18 min-w-0 items-center gap-3 px-4 sm:gap-4 lg:px-6">
        <InteractiveButton
          motion="toggle"
          ref={mobileButtonRef}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-black/8 xl:hidden"
        >
          {mobileOpen ? <IconX size={18} stroke={1.5} /> : <IconMenu2 size={18} stroke={1.5} />}
        </InteractiveButton>

        <div className="relative hidden xl:block" onMouseLeave={() => desktopOpen === "locations" && closeDesktop()}>
          <InteractiveButton
            motion="toggle"
            ref={(element) => { desktopTriggerRefs.current.locations = element; }}
            aria-label="Explore Circles House locations"
            aria-expanded={desktopOpen === "locations"}
            aria-controls={`${idPrefix}-locations`}
            onClick={() => setDesktopOpen((value) => value === "locations" ? null : "locations")}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setDesktopOpen("locations");
                focusFirstPanelItem(`${idPrefix}-locations`);
              }
            }}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-black/8"
          >
            <IconChevronDown size={16} stroke={1.5} className={`transition-transform duration-200 ${desktopOpen === "locations" ? "rotate-180" : ""}`} />
          </InteractiveButton>
          {desktopOpen === "locations" && (
            <DesktopDropdown
              item={{ status: "link", label: "Circles House locations", href: routes.home, menuLabel: "Circles House locations", children: locations }}
              panelId={`${idPrefix}-locations`}
              currentPath={currentPath}
              onNavigate={closeDesktop}
            />
          )}
        </div>

        <a href={routes.home} aria-label="Circles House — home" className="shrink-0">
          <img src="/brand/circles-wordmark.svg" alt="Circles" width="111" height="24" />
        </a>

        <nav aria-label="Main" className="ml-12 hidden min-w-0 flex-1 items-center gap-4 xl:flex">
          {nav.map((item) => {
            if (!isNavigationLink(item)) return null;
            const children = visibleChildren(item);
            const panelId = `${idPrefix}-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            const isOpen = desktopOpen === item.label;
            const isActive = hasCurrentDestination(item, currentPath);

            if (children.length === 0) {
              return (
                <a key={item.label} href={item.href} aria-current={isActive ? "page" : undefined} className={`text-sm transition-opacity hover:opacity-50 ${isActive ? "underline underline-offset-4" : ""}`}>
                  {item.label}
                </a>
              );
            }

            return (
              <div
                key={item.label}
                className="relative flex h-full items-center"
                onMouseEnter={() => setDesktopOpen(item.label)}
                onMouseLeave={() => isOpen && closeDesktop()}
              >
                <InteractiveButton
                  motion="toggle"
                  ref={(element) => { desktopTriggerRefs.current[item.label] = element; }}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  aria-haspopup="true"
                  onClick={() => setDesktopOpen((value) => value === item.label ? null : item.label)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault();
                      setDesktopOpen(item.label);
                      focusFirstPanelItem(panelId);
                    }
                  }}
                  className={`text-sm transition-opacity hover:opacity-50 ${isActive ? "underline underline-offset-4" : ""}`}
                >
                  {item.label}
                </InteractiveButton>
                {isOpen && <DesktopDropdown item={item} panelId={panelId} currentPath={currentPath} onNavigate={closeDesktop} />}
              </div>
            );
          })}
        </nav>

        {isNavigationLink(book) && (
          <a
            href={book.href}
            aria-current={isPathCurrent(currentPath, book.href) ? "page" : undefined}
            className="ml-auto inline-flex h-10 min-w-0 shrink-0 items-center justify-center rounded-full bg-black px-3 text-sm text-white sm:min-w-37 sm:px-5 xl:ml-1"
          >
            {book.label}
          </a>
        )}
      </div>

      <div id="mobile-menu" hidden={!mobileOpen} style={{ top: mobileMenuTop }} className="fixed inset-x-0 bottom-0 overflow-y-auto bg-white xl:hidden">
        <nav aria-label="Mobile" className="flex min-h-full flex-col gap-8 px-4 py-12">
          {nav.map((item, index) => {
            if (!isNavigationLink(item)) return null;
            const children = visibleChildren(item);
            const isExpanded = mobileSection === item.label;
            const sectionId = `${idPrefix}-mobile-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

            return (
              <div key={item.label} className="reveal-copy" style={{ animationDelay: `${index * 45}ms` }}>
                {children.length > 0 ? (
                  <InteractiveButton
                    motion="toggle"
                    aria-expanded={isExpanded}
                    aria-controls={sectionId}
                    onClick={() => setMobileSection((value) => value === item.label ? null : item.label)}
                    className="flex w-full items-center justify-between gap-4 text-left font-display text-[2.125rem] leading-none"
                  >
                    <span>{item.label}</span>
                    <IconChevronDown size={22} stroke={1.25} className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </InteractiveButton>
                ) : (
                  <a
                    href={item.href}
                    aria-current={isPathCurrent(currentPath, item.href) ? "page" : undefined}
                    onClick={closeMobile}
                    className={`block font-display text-[2.125rem] leading-none ${isPathCurrent(currentPath, item.href) ? "underline underline-offset-4" : ""}`}
                  >
                    {item.label}
                  </a>
                )}

                {children.length > 0 && isExpanded && (
                  item.href === routes.events ? (
                    <div id={sectionId} className="mt-6 grid gap-6 border-l border-black/15 pl-4">
                      {happeningGroups(children).map((group) => (
                        <div key={group.label}>
                          <p className="mb-3 text-xs uppercase tracking-[0.04em] text-black/45">{group.label}</p>
                          <div className="flex flex-col gap-3 font-display text-lg leading-[1.2]">
                            {group.items.map((child) => <MenuItem key={child.label} item={child} currentPath={currentPath} onNavigate={closeMobile} />)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div id={sectionId} className="mt-5 flex flex-col gap-4 border-l border-black/15 pl-4 font-display text-lg leading-[1.2]">
                      {children.map((child) => <MenuItem key={child.label} item={child} currentPath={currentPath} onNavigate={closeMobile} />)}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
