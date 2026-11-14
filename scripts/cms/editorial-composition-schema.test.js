import { describe, expect, it } from "vitest";
import {
  editorialCompositionFields,
  editorialEntityTypes,
  editorialSourceKeys,
  editorialSourceModes,
} from "./editorial-composition-schema.mjs";
import {
  EDITORIAL_ENTITY_TYPES,
  SECTION_SOURCE_KEYS,
  SECTION_SOURCE_MODES,
} from "../../src/domain/editorial";

describe("editorial composition Wix schema", () => {
  it("adds only the fields consumed by the application contract", () => {
    expect(editorialCompositionFields).toEqual({
      CHPageSections: expect.arrayContaining([
        expect.objectContaining({ key: "sourceMode", type: "TEXT" }),
        expect.objectContaining({ key: "sourceKey", type: "TEXT" }),
        expect.objectContaining({ key: "sourceLimit", type: "NUMBER" }),
      ]),
      CHSectionItems: expect.arrayContaining([
        expect.objectContaining({ key: "entityType", type: "TEXT" }),
        expect.objectContaining({ key: "entityKey", type: "TEXT" }),
      ]),
    });
    expect(Object.values(editorialCompositionFields).flatMap((fields) => fields)).toHaveLength(5);
  });

  it("keeps the migration and runtime values synchronized", () => {
    expect(editorialSourceModes).toEqual([...SECTION_SOURCE_MODES]);
    expect(editorialSourceKeys).toEqual([...SECTION_SOURCE_KEYS]);
    expect(editorialEntityTypes).toEqual([...EDITORIAL_ENTITY_TYPES]);
  });
});
