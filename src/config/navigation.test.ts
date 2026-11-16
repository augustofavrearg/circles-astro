import { describe, expect, it } from "vitest";
import { routes, siteNavigation, withDealsNavigation, withPostsNavigation } from "./navigation";

describe("site navigation", () => {
  it("does not expose an authentication action", () => {
    expect("login" in siteNavigation.header.actions).toBe(false);
  });

  it("uses canonical routes instead of home anchors", () => {
    expect(routes.home).toBe("/home");
    const links = siteNavigation.header.primary.filter((item) => item.status === "link");
    expect(links.every((item) => !item.href.includes("#"))).toBe(true);
    expect(links.find((item) => item.label === "Coliving")?.href).toBe(routes.location("barcelona"));
    expect(links.find((item) => item.label === "Events")?.href).toBe(routes.events);
    expect(links.find((item) => item.label === "Posts")?.href).toBe(routes.posts);
    expect(links.find((item) => item.label === "Deals")?.href).toBe(routes.deals);
    expect(siteNavigation.header.primary
      .flatMap((item) => "children" in item ? item.children ?? [] : [])
      .some((item) => item.status === "link" && item.href.startsWith("/months/")))
      .toBe(false);
    expect(routes.cityEvents("barcelona")).toBe("/events?location=barcelona");
    expect(routes.stayCampaign("barcelona", "2027-06")).toBe("/locations/barcelona/stays/2027-06");
    expect(routes.cityRooms("barcelona")).toBe("/rooms/barcelona");
    expect(routes.locationRoom("barcelona", "panoramic-loft")).toBe("/locations/barcelona/rooms/panoramic-loft");
    expect(routes.locationSpace("andorra", "restaurant")).toBe("/locations/andorra/spaces/restaurant");
  });

  it("models unavailable Andorra services as coming soon without links", () => {
    const comingSoon = siteNavigation.footer.extras.filter((item) => item.status === "comingSoon");
    expect(comingSoon.map((item) => item.label)).toEqual(["Coworking Andorra", "Spa Andorra"]);
    expect(comingSoon.every((item) => !("href" in item))).toBe(true);
  });

  it("provides the location data used by the desktop location menus", () => {
    expect(siteNavigation.header.locations).toEqual([
      expect.objectContaining({ status: "link", label: "Barcelona, Spain", image: "/images/locations/barcelona/house-exterior.png" }),
      expect.objectContaining({ status: "comingSoon", label: "Andorra, Andorra", image: "/images/locations/andorra/landscape.png" }),
    ]);
  });

  it("publishes implemented content routes and contains no co-owner entry", () => {
    expect(siteNavigation.footer.extras.find((item) => item.label === "News")).toEqual({
      status: "link",
      label: "News",
      href: "/posts",
    });
    expect(siteNavigation.footer.extras.some((item) => item.label.toLowerCase().includes("co-owner"))).toBe(false);
    expect(siteNavigation.footer.legal.every((item) => item.status === "link")).toBe(true);
  });

  it("adds Posts after Events to CMS navigation without duplicating it", () => {
    const cmsNavigation = [
      { status: "link", label: "Community", href: routes.lifeAtCircles },
      { status: "link", label: "Happening Now", href: routes.events },
      { status: "link", label: "About", href: routes.whatIsCircles },
    ] as const;

    expect(withPostsNavigation(cmsNavigation).map((item) => item.label)).toEqual([
      "Community",
      "Happening Now",
      "Posts",
      "About",
    ]);
    expect(withPostsNavigation(withPostsNavigation(cmsNavigation)).filter((item) => item.label === "Posts")).toHaveLength(1);
  });

  it("adds Deals to CMS navigation without duplicating it", () => {
    const cmsNavigation = [
      { status: "link", label: "About", href: routes.whatIsCircles },
    ] as const;

    expect(withDealsNavigation(cmsNavigation)).toEqual([
      ...cmsNavigation,
      { status: "link", label: "Deals", href: routes.deals },
    ]);
    expect(withDealsNavigation(withDealsNavigation(cmsNavigation)).filter((item) => item.label === "Deals")).toHaveLength(1);
  });
});
