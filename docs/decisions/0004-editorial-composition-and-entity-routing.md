# Editorial composition and entity routing

- Status: accepted
- Date: 2026-11-14
- Scope: page composition, entity ownership and public route exposure
- Supersedes: the required campaign-to-page composition in ADR 0002

## Context

The website combines stable editorial pages with content from multiple
locations and services, including rooms, spaces, events, programs, deals,
partners and Wix Blog posts. Editors need to compose magazine-like experiences
without duplicating the canonical data of those entities or creating a complete
page tree for every dynamic record.

## Decision

The existing `Page → Section → Item` hierarchy remains the editorial
composition model.

- A **Page** is a stable editorial destination or a reusable route template. A
  dynamic entity or temporal instance does not require its own Page record.
- A **Section** is a visual block. It may contain manual content, load entities
  through a code-defined source, or present an editor-curated selection.
- An **Item** is an editorial slot. It may contain manual content or reference a
  canonical entity, but it must not copy operational entity data.

Locations, rooms, spaces, events, programs, deals, partners, people and posts
remain canonical in their own collections or Wix application. Page composition
controls presentation; entity collections control identity and business data.

Dynamic routes provide a context to a reusable page template. Location-scoped
entities use location-scoped canonical routes when they have enough stable
content to be visited directly. The standard route families are:

- `/locations/:location`
- `/rooms/:location`
- `/locations/:location/rooms/:room`
- `/locations/:location/spaces/:space`
- `/events` and `/events/:event`
- `/programs/:program`
- `/posts` and `/posts/:post`

Wix Blog Posts are the single canonical editorial entity. Editorial concepts
such as News are Wix Blog categories, not separate collections or route
families. `/posts` may be filtered with a stable category slug, for example
`/posts?category=news`; the canonical detail route remains `/posts/:post`.

Not every collection item needs a detail route. The supported exposure levels
are embedded content, a collection page, a collection page plus entity detail,
or an external destination. Deals and partners may be presented inside Pages
without receiving individual internal routes.

Section data sources are a controlled application contract, not arbitrary CMS
queries. Examples include `location.rooms`, `location.spaces`,
`program.events`, `deals.active`, `partners.published` and
`blog.featuredPosts`.

When content is combined, canonical entity fields take precedence for identity
and operational data. Sections and Items may control order and approved
presentation overrides, but they may not override fields such as location,
dates, price, availability or booking destination.

## Consequences

- Multiple locations and services reuse the same page templates and route
  families.
- A new entity normally requires only a record in its canonical collection.
- Pages can mix manual editorial content with rooms, events, posts, deals,
  partners and other entities without duplicating them.
- Existing static Pages remain valid and can migrate incrementally.
- Dynamic content currently coupled to a dedicated Page must be decoupled
  before that Page or its relations are removed.
- CMS audits must eventually validate source keys, entity references and route
  uniqueness in addition to collection shape.

The executable contract lives in `src/domain/editorial.ts` and
`src/config/entity-routes.ts`. The additive Wix schema migration is
`scripts/cms/migrate-editorial-composition.mjs`; it is dry-run by default and
may only write to the approved staging site when explicitly run with `--apply`.
