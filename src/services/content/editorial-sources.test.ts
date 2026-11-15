import { describe, expect, it, vi } from "vitest";
import { fixtureRepository } from "./repository";
import { resolveEditorialSource } from "./editorial-sources";

describe("editorial source resolver", () => {
  it("loads location-scoped Rooms and respects limits", async () => {
    const rooms = await resolveEditorialSource(
      fixtureRepository,
      { mode: "automatic", key: "location.rooms", limit: 2 },
      { location: "barcelona" },
      "location.rooms",
    );
    expect(rooms).toHaveLength(2);
    expect(rooms.every((room) => room.locationId === "barcelona")).toBe(true);
  });

  it("loads active Deals and published Partners through their repository contracts", async () => {
    const deals = await resolveEditorialSource(
      fixtureRepository,
      { mode: "automatic", key: "deals.active" },
      {},
      "deals.active",
    );
    const partners = await resolveEditorialSource(
      fixtureRepository,
      { mode: "automatic", key: "partners.published" },
      {},
      "partners.published",
    );
    expect(deals.length).toBeGreaterThan(0);
    expect(partners.length).toBeGreaterThan(0);
  });

  it("rejects a mismatched or manual source before loading data", async () => {
    const getDeals = vi.spyOn(fixtureRepository, "getDeals");
    await expect(resolveEditorialSource(
      fixtureRepository,
      { mode: "manual" },
      {},
      "deals.active",
    )).rejects.toThrow(/requires sourceKey/);
    expect(getDeals).not.toHaveBeenCalled();
    getDeals.mockRestore();
  });
});
