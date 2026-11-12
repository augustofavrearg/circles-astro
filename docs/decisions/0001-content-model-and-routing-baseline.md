# Content model and routing baseline

- Status: superseded in part by ADR 0002
- Date: 2026-11-08
- Scope: CMS content sourcing and public route identifiers

## Decision

The CH v1.1 model was closed as the implementation baseline: 21 Wix
collections and 267 fields. It is intentionally frozen for the current delivery
phase; changing it requires an explicit project decision rather than an
incidental code change.

Fixtures remain available only as an explicit offline development source. When
`CONTENT_SOURCE=wix`, the application must use Wix content exclusively. Missing
required CMS content must fail visibly and must never be completed with fixture
data. An indexable production build must use `CONTENT_SOURCE=wix`.

The original canonical monthly page route was `/months/june`. ADR 0002 replaces
this route with a location- and period-specific stay campaign route.

`CHPrograms.slug = founders-month` identifies a reusable event program.
Individual `CHEvents` may reference that program, while other June events may
exist without it. A program-to-page reference is a connection between distinct
records; it does not make `founders-month` the page slug.

Programs have their own canonical route at `/programs/:slug`. Consequently,
`founders-month` resolves to `/programs/founders-month`; the word `month` in the
slug is part of the program name and has no routing semantics. Program pages
list events by the `CHEvents.program` reference, while month pages select events
by calendar period.

The `/co-owners` route is not part of the product and is removed from route
resolution and navigation.

The canonical Home route is `/home`. The root `/` contains no page content and
permanently redirects to `/home`, preserving a single canonical destination.

## Consequences

- CMS omissions can no longer be hidden by plausible test content.
- Preview and release checks must include the live CMS audit and public-route
  smoke tests.
- Offline frontend work can still use fixtures while indexing remains disabled.
- Any Wix navigation record using the removed `co-owners` route key is invalid
  and must be deleted or changed in the CMS.
