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

  it("keeps the archive active for filtered pages and matches filtered links precisely", () => {
    expect(isPathCurrent("/posts?category=news", "/posts")).toBe(true);
    expect(isPathCurrent("/posts?category=news&page=2", "/posts?category=news")).toBe(true);
    expect(isPathCurrent("/posts?category=announcement", "/posts?category=news")).toBe(false);
    expect(isPathCurrent("/posts", "/posts?category=news")).toBe(false);
  });
});
