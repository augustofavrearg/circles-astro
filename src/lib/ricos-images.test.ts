import { describe, expect, it } from "vitest";
import { optimizeRicosImages } from "./ricos-images";

describe("Ricos image normalization", () => {
  it("limits images to twice their visual width while preserving their ratio", () => {
    const content = {
      nodes: [{
        type: "IMAGE",
        imageData: {
          containerData: { width: { custom: "326" } },
          image: { width: 1122, height: 1402, src: { id: "photo.jpeg" } },
        },
      }],
    };

    const optimized = optimizeRicosImages(content) as typeof content;
    expect(optimized.nodes[0].imageData.image).toMatchObject({ width: 652, height: 815 });
    expect(content.nodes[0].imageData.image).toMatchObject({ width: 1122, height: 1402 });
  });

  it("does not upscale small images", () => {
    const image = { type: "IMAGE", imageData: { image: { width: 236, height: 354 } } };
    expect(optimizeRicosImages(image)).toEqual(image);
  });
});
