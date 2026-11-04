export type NavigationLink = {
  status: "link";
  label: string;
  href: string;
  image?: string;
  menuLabel?: string;
  children?: readonly NavigationItem[];
};

export type NavigationComingSoon = {
  status: "comingSoon";
  label: string;
  badge?: string;
  image?: string;
};

export type NavigationHidden = {
  status: "hidden";
  label: string;
};

export type NavigationItem = NavigationLink | NavigationComingSoon | NavigationHidden;

export type HeaderNavigation = {
  locations: readonly NavigationItem[];
  primary: readonly NavigationItem[];
  actions: {
    login: NavigationItem;
    book: NavigationItem;
  };
};

export type FooterNavigation = {
  main: readonly NavigationItem[];
  extras: readonly NavigationItem[];
  legal: readonly NavigationItem[];
};

export type SiteNavigation = {
  header: HeaderNavigation;
  footer: FooterNavigation;
};

export function isNavigationLink(item: NavigationItem): item is NavigationLink {
  return item.status === "link";
}

export function isVisibleNavigationItem(item: NavigationItem): item is NavigationLink | NavigationComingSoon {
  return item.status !== "hidden";
}

export function isPathCurrent(currentPath: string, href: string) {
  const normalize = (path: string) => path !== "/" ? path.replace(/\/+$/, "") : path;
  return normalize(currentPath) === normalize(href);
}
