import { describe, expect, it } from "vitest";
import { wixImageSrcSet, wixImageUrl } from "./wix-image";

const original = "https://static.wixstatic.com/media/example~mv2.png";

describe("Wix image variants", () => {
  it("creates width-limited, auto-encoded CDN URLs", () => {
    expect(wixImageUrl(original, 800)).toBe(
      "https://static.wixstatic.com/media/example~mv2.png/v1/fit/w_800,h_8000,al_c,q_75,enc_auto/example~mv2.png",
    );
  });

  it("provides responsive candidates without modifying other hosts", () => {
    expect(wixImageSrcSet(original)).toContain("w_320,h_8000");
    expect(wixImageSrcSet(original)).toContain("w_2000,h_8000");
    expect(wixImageUrl("https://example.com/photo.jpg", 800)).toBe("https://example.com/photo.jpg");
    expect(wixImageSrcSet("https://example.com/photo.jpg")).toBeUndefined();
  });
});
