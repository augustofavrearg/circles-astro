# Content model and routing baseline

- Status: accepted
- Date: 2026-11-08
- Scope: CMS content sourcing and public route identifiers

## Decision

The current CH v1.1 model is closed as the implementation baseline: 21 Wix
collections and 267 fields. It is intentionally frozen for the current delivery
phase; changing it requires an explicit project decision rather than an
incidental code change.

Fixtures remain available only as an explicit offline development source. When
`CONTENT_SOURCE=wix`, the application must use Wix content exclusively. Missing
required CMS content must fail visibly and must never be completed with fixture
data. An indexable production build must use `CONTENT_SOURCE=wix`.

The canonical monthly page route is `/months/june`. Its `june` route parameter
identifies a calendar/editorial page, not a program.

`CHPrograms.slug = founders-month` identifies a reusable event program.
Individual `CHEvents` may reference that program, while other June events may
exist without it. A program-to-page reference is a connection between distinct
records; it does not make `founders-month` the page slug.

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
