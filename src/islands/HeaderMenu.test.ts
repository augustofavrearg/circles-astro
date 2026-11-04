import { describe, expect, it } from "vitest";
import { isPathCurrent } from "../domain/navigation";

describe("HeaderMenu route state", () => {
  it("recognizes the current canonical route", () => {
    expect(isPathCurrent("/events", "/events")).toBe(true);
    expect(isPathCurrent("/events/", "/events")).toBe(true);
  });

  it("does not mark a parent route active by prefix alone", () => {
    expect(isPathCurrent("/events/barcelona", "/events")).toBe(false);
  });
});
