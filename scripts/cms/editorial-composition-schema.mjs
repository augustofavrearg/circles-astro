export const editorialSourceModes = ["manual", "automatic", "curated"];

export const editorialSourceKeys = [
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
];

export const editorialEntityTypes = [
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
];

export const editorialCompositionFields = {
  CHPageSections: [
    {
      key: "sourceMode",
      displayName: "Source Mode",
      type: "TEXT",
    },
    {
      key: "sourceKey",
      displayName: "Source Key",
      type: "TEXT",
    },
    {
      key: "sourceLimit",
      displayName: "Source Limit",
      type: "NUMBER",
    },
  ],
  CHSectionItems: [
    {
      key: "entityType",
      displayName: "Entity Type",
      type: "TEXT",
    },
    {
      key: "entityKey",
      displayName: "Entity Key",
      type: "TEXT",
    },
  ],
};
