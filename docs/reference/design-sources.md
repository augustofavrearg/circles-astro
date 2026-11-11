# Design sources and traceability

- Status: active
- Owner: Website Lead
- Last reviewed: 2026-11-10
- Scope: stable references connecting ClickUp tasks, Figma screens, repository routes, and recovered assets.
Does not cover: approval of copy, prices, legal facts, dates, external URLs, or CMS publication.

## Active Figma source

- File: `Circles - website`
- File key: `Qj5kHpnB9PH9YHuKCuI5ol`
- Desktop page: `Desktop - v1.14` (`868:4507`)
- Mobile page: `Mobile - v1.13` (`840:12598`)

The task must identify the exact desktop and mobile frame IDs used for implementation or review. A page name or screenshot without node IDs is not a reproducible reference.

## Required task reference

Visual tasks must record:

```text
Figma file: Circles - website (Qj5kHpnB9PH9YHuKCuI5ol)
Desktop: Desktop - v1.14 / [frame name] / [node ID] / [width]
Mobile: Mobile - v1.13 / [frame name] / [node ID] / [width]
Intentional differences: [none or explicit list]
Asset registry: [path under assets/figma or not applicable]
```

If Figma access or MCP quota prevents verification, the task remains blocked for visual approval. Existing repository comments or fixtures are not substitutes for the approved frame.

## Repository registry

Recovered media use stable local paths and checksums under [`../../assets/figma/`](../../assets/figma/). Current coverage:

| Route | Registry | Status |
|---|---|---|
| `/home` | [`../../assets/figma/home.json`](../../assets/figma/home.json) | 16 recovered assets |

Other routes do not yet have a complete asset registry. Add one registry per screen when assets are recovered; never store temporary Figma download URLs.

## Authority boundaries

- Figma approves layout, visual hierarchy, responsive composition, and identified design assets.
- ClickUp approves scope, provisional exceptions, owners, and acceptance criteria.
- Wix owns current editorial records and relationships for the named environment.
- Git owns route behavior, rendering, validation, and technical constraints.

When these sources conflict, record the conflict in ClickUp and obtain a decision before implementation or approval.
