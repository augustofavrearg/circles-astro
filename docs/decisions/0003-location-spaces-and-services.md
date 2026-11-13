# ADR 0003: Location-scoped spaces and services

- Status: Accepted
- Date: 2026-11-13

## Context

Each Circles House location can offer a different set of public experiences and services. Andorra, for example, includes a restaurant and spa, while Barcelona has a rooftop. The existing `CHSpaces` collection already stores these offerings alongside operational spaces such as booths and hot desks, but it did not distinguish reusable internal records from offerings that deserve a public destination page.

## Decision

`CHSpaces` remains the canonical source for physical spaces, services, and location-specific experiences. A record becomes publicly discoverable only when it is published, is not hidden, has `discoverable = true`, and defines a location-scoped `routeSlug`.

The canonical route is `/locations/:location/spaces/:routeSlug`. The combination of `location + routeSlug` must be unique. Location pages list their discoverable spaces automatically. An optional reference to `CHPages` can add editorial story, FAQ, and SEO composition, but the base `CHSpaces` record is sufficient to render a complete detail page.

`CHAmenities` remains a reusable attribute vocabulary. Amenities are not standalone service pages and do not replace `CHSpaces`.

## Consequences

- The same route slug can be reused at different locations, while remaining unambiguous.
- Existing operational records remain private from routing unless editors opt them in.
- New locations can introduce unique offerings without adding hard-coded Astro pages.
- Wix has reached its global custom-index quota, so no new compound index is added. The migration, runtime repository, and CMS health audit enforce uniqueness for `location + routeSlug`.
- External booking or information actions are optional; coming-soon pages remain useful without inventing a CTA.
