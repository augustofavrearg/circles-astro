import { describe, expect, it } from "vitest";
import { routes, siteNavigation } from "./navigation";

describe("site navigation", () => {
  it("keeps Members Login hidden until authentication exists", () => {
    expect(siteNavigation.header.actions.login).toEqual({ status: "hidden", label: "Members Login" });
  });

  it("uses canonical routes instead of home anchors", () => {
    expect(routes.home).toBe("/home");
    const links = siteNavigation.header.primary.filter((item) => item.status === "link");
    expect(links.every((item) => !item.href.includes("#"))).toBe(true);
    expect(links.find((item) => item.label === "Coliving")?.href).toBe(routes.location("barcelona"));
    expect(links.find((item) => item.label === "Events")?.href).toBe(routes.events);
    expect(siteNavigation.header.primary
      .flatMap((item) => "children" in item ? item.children ?? [] : [])
      .some((item) => item.status === "link" && item.href.startsWith("/months/")))
      .toBe(false);
    expect(routes.cityEvents("barcelona")).toBe("/events?location=barcelona");
    expect(routes.stayCampaign("barcelona", "2027-06")).toBe("/locations/barcelona/stays/2027-06");
    expect(routes.cityRooms("barcelona")).toBe("/rooms/barcelona");
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
    expect(siteNavigation.footer.extras.find((item) => item.label === "News")?.status).toBe("link");
    expect(siteNavigation.footer.extras.some((item) => item.label.toLowerCase().includes("co-owner"))).toBe(false);
    expect(siteNavigation.footer.legal.every((item) => item.status === "link")).toBe(true);
  });
});
