# Events, programs and stay campaigns

- Status: accepted
- Date: 2026-11-12
- Scope: event discovery, program geography and commercial monthly pages
- Supersedes: the monthly routing and single-location program decisions in ADR 0001

## Context

The site needs to expose three related but independent concepts. An event is a
concrete occurrence at one location and time. A program groups events and may
span one, several or all locations. A monthly stay campaign sells coliving for
a specific location and calendar period; it is not an event program and it is
not the events explorer's month filter.

The previous model attached a program to one location and inferred the location
of `/months/:slug` through a program-to-page reference. That made names such as
`founders-month` look temporal even though `month` is merely part of the program
name, and it could not represent a program spanning Barcelona and Andorra.

## Decision

`CHEvents` remains the source of concrete occurrences. Every event has exactly
one `CHLocations` reference, a start date and timezone, and zero or one
`CHPrograms` reference. Its canonical route is `/events/:eventSlug`.

`CHPrograms` gains `locationScope`, with values `selected` or `all`, and a
multi-reference field named `locations`. A selected program must reference at
least one permitted location. Every linked event must occur at one of those
locations. An all-locations program may contain events from any published
location. The existing singular `location` field remains only during the
migration window and is not authoritative after migration.

The global event explorer lives at `/events`. Its filters are URL query state:
`month=YYYY-MM`, repeated `location` parameters and repeated `program`
parameters. Values within one dimension use OR semantics; different dimensions
use AND semantics. Filter combinations do not create new canonical content
pages.

Programs keep stable canonical pages at `/programs/:slug`. A program page may
offer location filtering without changing the program's identity.

A new `CHStayCampaigns` collection connects one location, one `YYYY-MM` period
and one `CHPages` content record. Its canonical route is
`/locations/:location/stays/:period`. An optional `legacyRouteParam` supports
permanent redirects from historical `/months/:slug` URLs. The combination of
location and period must be unique. Because this Wix site has reached its global
index quota, that invariant is enforced by the migration, repository and CMS
audit rather than by an additional collection index.

Legacy `/events/:location` URLs permanently redirect to the equivalent event
explorer filter. Because event slugs and location slugs share that historical
path shape, location slugs are reserved and cannot be used as event slugs.

## Consequences

- A program can represent Barcelona-only, Andorra-only, selected multi-location
  or global programming without duplicating the program.
- A month in the event explorer is a temporal filter, not a content type.
- Monthly commercial pages remain editorially rich but are unambiguously tied
  to the inventory and context of one location.
- CMS validation must reject invalid periods, duplicate location-period
  campaigns and program/event location mismatches.
- The CMS baseline becomes 22 collections after `CHStayCampaigns` is created;
  code and data must be migrated before the new routes are released.
