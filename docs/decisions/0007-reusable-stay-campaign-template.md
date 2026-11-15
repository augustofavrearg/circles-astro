# ADR 0007: Reusable stay campaign template

- Status: Accepted
- Date: 2026-11-14

## Context

The initial monthly experience coupled `CHStayCampaigns` to a dedicated `CHPages`
record named `june`, nine month-specific sections, and copied event cards. Repeating
that structure for every location and month would make editorial records grow with
the number of campaigns instead of with the number of actual layouts and entities.

## Decision

All stay campaigns use one published Page, `stay-campaign-template`, containing the
reusable structural sections hero, form, space, rooms, band, events, and FAQ.
`CHStayCampaigns` owns the campaign name, location, period, legacy route key, and
publication state; it no longer needs a Page reference.

The canonical URL remains `/locations/:location/stays/:period`. Rooms and events are
resolved from their canonical collections using the campaign location and period.
Optional editorial blocks may be added to the template, but records must not be
copied merely because a new calendar month starts. `/months/:slug` remains a legacy
redirect only.

## Consequences

Adding a campaign requires one `CHStayCampaigns` record, not a new Page hierarchy.
Changing template structure affects all campaigns. Campaign-specific entities stay
in their canonical collections and can be reused elsewhere. The old `june` Page,
its sections, and copied SectionItems can be removed only after the reusable
template and cleared references have been verified.
