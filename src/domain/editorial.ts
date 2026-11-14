export const SECTION_SOURCE_MODES = ["manual", "automatic", "curated"] as const;
export type SectionSourceMode = (typeof SECTION_SOURCE_MODES)[number];

export const SECTION_SOURCE_KEYS = [
  "locations.featured",
  "spaces.featured",
  "events.featured",
  "blog.featuredPosts",
  "location.rooms",
  "location.spaces",
  "location.coworkingSpaces",
  "program.events",
  "deals.active",
  "partners.published",
  "people.team",
  "membershipPlans.published",
] as const;
export type SectionSourceKey = (typeof SECTION_SOURCE_KEYS)[number];

export const EDITORIAL_ENTITY_TYPES = [
  "location",
  "room",
  "space",
  "event",
  "program",
  "post",
  "deal",
  "partner",
  "person",
  "membershipPlan",
] as const;
export type EditorialEntityType = (typeof EDITORIAL_ENTITY_TYPES)[number];

export type EditorialContext = {
  location?: string;
  program?: string;
};

export type SectionSourceConfig = {
  mode: SectionSourceMode;
  key?: SectionSourceKey;
  limit?: number;
};

export type EditorialEntityReference = {
  type: EditorialEntityType;
  key: string;
};

const sourceRequirements = {
  "locations.featured": [],
  "spaces.featured": [],
  "events.featured": [],
  "blog.featuredPosts": [],
  "location.rooms": ["location"],
  "location.spaces": ["location"],
  "location.coworkingSpaces": ["location"],
  "program.events": ["program"],
  "deals.active": [],
  "partners.published": [],
  "people.team": [],
  "membershipPlans.published": [],
} as const satisfies Record<SectionSourceKey, readonly (keyof EditorialContext)[]>;

function normalizedText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
export function parseSectionSource(record: Record<string, unknown>): SectionSourceConfig {
  const rawMode = normalizedText(record.sourceMode) || "manual";
  if (!SECTION_SOURCE_MODES.includes(rawMode as SectionSourceMode)) {
    throw new Error(`Unknown editorial sourceMode "${rawMode}".`);
  }
  const mode = rawMode as SectionSourceMode;
  const rawKey = normalizedText(record.sourceKey);

  if (mode === "manual" && rawKey) {
    throw new Error("Manual editorial sections cannot declare sourceKey.");
  }
  if (mode !== "manual" && !rawKey) {
    throw new Error(`Editorial sourceMode "${mode}" requires sourceKey.`);
  }
  if (rawKey && !SECTION_SOURCE_KEYS.includes(rawKey as SectionSourceKey)) {
    throw new Error(`Unknown editorial sourceKey "${rawKey}".`);
  }

  const rawLimit = record.sourceLimit;
  const limit = rawLimit === undefined || rawLimit === null || rawLimit === ""
    ? undefined
    : Number(rawLimit);
  if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
    throw new Error("Editorial sourceLimit must be an integer between 1 and 100.");
  }

  return {
    mode,
    ...(rawKey ? { key: rawKey as SectionSourceKey } : {}),
    ...(limit ? { limit } : {}),
  };
}

export function assertSectionSourceContext(
  source: SectionSourceConfig,
  context: EditorialContext,
): void {
  if (!source.key) return;
  for (const field of sourceRequirements[source.key]) {
    if (!context[field]) {
      throw new Error(`Editorial sourceKey "${source.key}" requires ${field} context.`);
    }
  }
}

export function parseEditorialEntityReference(
  record: Record<string, unknown>,
): EditorialEntityReference | undefined {
  const rawType = normalizedText(record.entityType);
  const key = normalizedText(record.entityKey);
  if (!rawType && !key) return undefined;
  if (!rawType || !key) {
    throw new Error("Editorial entity references require both entityType and entityKey.");
  }
  if (!EDITORIAL_ENTITY_TYPES.includes(rawType as EditorialEntityType)) {
    throw new Error(`Unknown editorial entityType "${rawType}".`);
  }
  return { type: rawType as EditorialEntityType, key };
}
