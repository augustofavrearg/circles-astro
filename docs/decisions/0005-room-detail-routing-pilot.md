# Room detail routing pilot

- Status: accepted
- Date: 2026-11-14
- Scope: canonical Room detail exposure
- Extends: ADR 0004

## Context

Rooms already appear inside location, room-listing and stay-campaign Pages. The
canonical business data belongs to `CHRooms`, but visitors also need a stable
destination for selected room categories. Creating one `CHPages` record for
every Room would duplicate identity and make the editorial tree grow with the
inventory.

## Decision

`CHRooms` remains canonical. A published record receives a public detail route
only when `discoverable = true`. Its route is
`/locations/:location/rooms/:roomSlug`, using the Room's existing `slug` inside
its location context.

The canonical Room record is sufficient to render the base page: name,
description, media, features, amenities, views, price and booking destination.
A `CHPages` record is not created for the pilot. If a future Room needs a richer
editorial story, reusable Page composition may be added as an optional
enhancement without moving operational fields out of `CHRooms`.

P2 activates only `king-studio-terrace-sea-view` in Barcelona. Other Rooms keep
working in listings and Cloudbeds without receiving detail routes. Editors can
opt in additional records after their content is complete and reviewed.

Location Page room sections use the controlled automatic source
`location.rooms`. The Section owns the heading and editorial framing while the
source loads canonical Rooms for the route's location context.

## Consequences

- Room cards link to details only when the canonical record is discoverable.
- Direct requests for unpublished, unknown or non-discoverable Rooms return
  `404`.
- Location plus Room slug must be unique among discoverable records.
- The CMS health audit validates route completeness and uniqueness.
- No additional Page, Section or Item record is required per Room.
