# Embedded entity Page sources

- Status: accepted
- Date: 2026-11-14
- Scope: Deals and Partners inside editorial Pages
- Extends: ADR 0004

## Context

Deals and Partners are reusable canonical entities, but they do not need the
same public weight as Rooms. Deals belong to one collection destination and
Partners normally lead to an external website. Their current routes loaded
collections directly without expressing that relationship in Page composition.

## Decision

The stable `/deals` destination owns one `CHPages` record and one
`deals.list` Section. The Section uses the controlled automatic source
`deals.active`, which loads only published Deals inside their validity window.
Individual Deals do not receive internal detail routes.

The Partnerships Page owns one `partnerships.partners` Section using
`partners.published`. Canonical Partner records supply identity, description,
logo, featured state and external destination. Individual Partners do not
receive internal routes.

The application resolves controlled sources through one registry. A Section
must request the exact source expected by its consumer; arbitrary source keys
and manual fallbacks are rejected. `sourceLimit`, when present, is applied after
the canonical repository query.

## Consequences

- Page and Section records control editorial framing and placement.
- `CHDeals` and `CHPartners` remain the only sources of entity data.
- Adding a Deal or Partner does not grow `CHPages` or the internal route tree.
- `/deals` remains a stable collection destination even when no Deal is active.
- Partners continue to use external links when provided.
- The CMS health audit requires the automatic source declarations.
