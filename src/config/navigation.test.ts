import { describe, expect, it } from "vitest";
import { routes, siteNavigation } from "./navigation";

describe("site navigation", () => {
  it("keeps Members Login hidden until authentication exists", () => {
    expect(siteNavigation.header.actions.login).toEqual({ status: "hidden", label: "Members Login" });
  });

  it("uses canonical routes instead of home anchors", () => {
    const links = siteNavigation.header.primary.filter((item) => item.status === "link");
    expect(links.every((item) => !item.href.includes("#"))).toBe(true);
    expect(links.find((item) => item.label === "Coliving")?.href).toBe(routes.location("barcelona"));
    expect(links.find((item) => item.label === "Happening Now")?.href).toBe(routes.events);
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

  it("does not publish routes whose pages have not been created", () => {
    expect(siteNavigation.footer.extras.find((item) => item.label === "News")?.status).toBe("hidden");
    expect(siteNavigation.footer.extras.find((item) => item.label === "Become a co-owner")?.status).toBe("hidden");
    expect(siteNavigation.footer.legal.every((item) => item.status === "hidden")).toBe(true);
  });
});
